// ============================================================
// Liquid Glass · L3 液态跟手层
// ============================================================
// 职责：把「指针 / 触摸」的位置，经缓动后写进**每个液态元素自己**的 CSS 变量。
// 样式与材质全部在 CSS（global.css + glass.ts），本文件不产生任何元素。
//
// 【为什么是「每个元素自己」而不是全局】
//   若把 --mx/--my 写在 <html> 上，所有卡片共享同一套坐标，
//   视觉上就变成「一个全局光源把所有卡片一起照亮」—— 卡片位置错开时
//   更是错得离谱（同一坐标在每张卡上落在不同相对位置，但看起来是同步的）。
//   液态玻璃的高光必须相对**元素自身**，才有「光标下方的这块玻璃被照亮」的物理感。
//
// 【性能铁律】
//   1. 全局仍然只有一个 pointermove 监听 + 一个 rAF 循环。
//      遍历元素列表写变量，绝不「每元素一个 listener」。
//   2. 用缓存的 rect（非滚动时复用），避免每帧强制同步布局（layout thrashing）。
//      只在 scroll / resize 后失效重测。
//   3. 每帧只写自定义属性；且缓动收敛即停 rAF，不空转烧电。
//   4. 页面不可见时停掉。
//
// 【元素级变量契约】（写在宿主元素自身的 style 上）
//   --mx / --my  指针相对该元素的归一化坐标（可为负值或 >100%，表示指针在元素外）
//   --lite       指针是否在该元素内：1 = 在内部，0 = 在外部
//   --sheen-t    元素高光强度（由 CSS 的 html[data-glass] 档位决定，JS 不写）
//
// 【全局属性契约】（写在 <html> 上，供 CSS 做"整组响应"）
//   data-glass   full | lite | static | fallback —— 设备能力档位（自动检测）
//   data-liquid  on | off —— 用户偏好开关（底栏那个开关）
//   data-input   hover | touch —— 输入形态。触屏要靠它开 touch-action，
//                绝不能给鼠标设备也开（见 global.css 触屏一节）
//   data-focus   inside —— 指针**真正落在某个液态元素内**。邻卡后退
//                由它驱动，而不是靠 CSS :hover（:hover 分不清
//                "指针在卡片上"和"指针在卡片之间的空隙里"）

type Tier = "full" | "lite" | "static" | "fallback";

/** 特性 + 偏好检测。刻意不用 UA 嗅探（不可靠且易误判）。 */
function detectTier(): Tier {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // reduce 管的是"动"，不是"美"：仍返回 static（保留材质），而非 fallback
  if (reduceMotion) return "static";

  const supportsBackdrop =
    typeof CSS !== "undefined" &&
    CSS.supports &&
    (CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)"));

  const supportsSvgFilter =
    typeof CSS !== "undefined" && CSS.supports && CSS.supports("filter", "url(#x)");

  // 老 Firefox / 低端安卓 WebView 等：退回纯静态材质
  if (!supportsBackdrop || !supportsSvgFilter) return "fallback";

  // 省流模式 / 低内存设备 → 减配，仍是动态的，只是更克制
  const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (conn?.saveData === true) return "lite";
  if (typeof deviceMemory === "number" && deviceMemory <= 4) return "lite";

  return "full";
}

const TIERS: readonly Tier[] = ["full", "lite", "static", "fallback"];

/** 调试开关：URL 带 ?glass=lite 可强制档位，用于逐档验收降级效果。
 *  生产环境无害 —— 不带参数时完全不生效，也不写入任何东西。 */
function forcedTier(): Tier | null {
  try {
    const v = new URLSearchParams(location.search).get("glass");
    return v && (TIERS as readonly string[]).includes(v) ? (v as Tier) : null;
  } catch {
    return null;
  }
}

const tier = forcedTier() ?? detectTier();
document.documentElement.dataset.glass = tier;

// ------------------------------------------------------------
// 用户开关（data-liquid）—— 与「能力档位」正交。
// 提到模块级：导航栏材质与页壳让位也依赖它，不能只在 tier 代码块里可见。
// 偏好在 <head> 的内联脚本里于首绘前写入，这里只读取。
// ------------------------------------------------------------
let liquidEnabled = document.documentElement.dataset.liquid !== "off";

// ============================================================
// 滚动驱动导航栏材质
// ============================================================
// 「玻璃随内容滚动而变实」是 Liquid Glass「材质响应环境」的核心一条。
//
// 做法：JS 只写一个 --nav-scrim 到 <html>，CSS 用它叠一层**深色**遮罩。
//   CSS 背景是分层绘制的：background-image 画在 background-color 之上。
//   所以「变实」靠加深色，而不必突破「白玻璃 ≤ 12%」的规范上限。
//
// 【刻意不做模糊半径渐变】backdrop-filter 的模糊值每帧变化 = 每帧重算滤镜，
//   既昂贵，又会在部分 Chrome 版本上闪烁（灯箱那次已确认这个坑）。
//   所以模糊恒定，只渐入深色遮罩 —— 实测已足够把白字对比度救回来。
const NAV_RAMP_PX = 140; // 滚过这么多像素到达最强
const NAV_MAX = 0.35; // A 档强度
let navApplied = -1;
let navRaf = 0;

function applyNavScrim() {
  navRaf = 0;
  const t = Math.min(1, Math.max(0, window.scrollY / NAV_RAMP_PX));
  const eased = 1 - (1 - t) * (1 - t); // easeOut：起手快、后段缓，避免刚滚动就跳变
  const v = liquidEnabled ? eased * NAV_MAX : 0;
  // 变化太小就不写，省掉无意义的样式重算
  if (Math.abs(v - navApplied) < 0.004) return;
  navApplied = v;
  document.documentElement.style.setProperty("--nav-scrim", v.toFixed(3));
}

window.addEventListener(
  "scroll",
  () => {
    // 每帧最多写一次（滚动事件可能一帧触发多次）
    if (!navRaf) navRaf = requestAnimationFrame(applyNavScrim);
  },
  { passive: true }
);
applyNavScrim();

// 宿主选择器：与 glass.ts 的 liquidTarget 常量保持一致
const SURFACE_SELECTOR = ".liquid-surface";

if (tier === "full" || tier === "lite") {
  // ---- 元素登记表（带缓动状态）----
  interface Surface {
    el: HTMLElement;
    rect: DOMRect;   // 缓存，非滚动时复用，避免每帧 getBoundingClientRect
    tx: number;      // 目标值（相对该元素的归一化坐标）
    ty: number;
    px: number;      // 当前值（缓动后）
    py: number;
    inView: boolean; // 是否在视口内 —— 不在视口就跳过，省算力
  }

  const surfaces: Surface[] = [];
  let rectsDirty = true;

  function collect() {
    surfaces.length = 0;
    document.querySelectorAll<HTMLElement>(SURFACE_SELECTOR).forEach((el) => {
      surfaces.push({
        el,
        rect: new DOMRect(),
        // 默认光位：右上（与 body 背景主光斑同向），未移动指针时也好看
        tx: 0.78,
        ty: 0.08,
        px: 0.78,
        py: 0.08,
        inView: true,
      });
    });
    rectsDirty = true;
  }

  function refreshRects() {
    const vh = window.innerHeight;
    for (const s of surfaces) {
      s.rect = s.el.getBoundingClientRect();
      // 视口外（含上下各留一屏缓冲）直接不参与，省掉无效计算
      s.inView = s.rect.bottom > -vh && s.rect.top < vh * 2;
    }
    rectsDirty = false;
  }

  // 全局指针位置（客户端坐标，像素）—— 唯一的指针状态
  let clientX = window.innerWidth * 0.78;
  let clientY = window.innerHeight * 0.08;

  // 是否有真正的 hover 能力。触屏没有 hover，改用「按住」作为活跃条件。
  const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // 活跃状态：桌面恒为 true（跟随 hover）；触屏只在按住期间为 true。
  let pressed = hasHover;

  // 输入形态写到 <html>，供 CSS 决定要不要开 touch-action。
  // 用能力查询而非 UA：改装机、外接鼠标的平板都能判对。
  document.documentElement.dataset.input = hasHover ? "hover" : "touch";

  let raf = 0;

  // 缓动系数：越小越"粘滞"。这是液态感的来源 ——
  // 高光"追着"指针走，而不是硬贴在指针上。
  const EASE = 0.12;
  // 收敛阈值：所有元素都收敛就停 rAF
  const EPSILON = 0.002;

  // 内外判定容差：**单位是像素，不是百分比**。
  //
  // 【为什么必须是像素 —— 这是"四向灵敏度不一致"的真正根因】
  //   旧实现用归一化坐标比较（`Math.abs(tx-0.5) < 0.5 + EPS`，EPS=0.05），
  //   等价于"在元素外再放宽元素尺寸的 5%"。
  //   但 5% 在不同尺寸上换算出的**像素**差异巨大：
  //     · 368×260 的卡片  → 左右各放宽 18.4px、上下各放宽 13px
  //     · 340×1200 的长卡 → 左右 17px、上下 60px
  //     · 1920×65 的导航栏 → 左右 96px、上下 3.25px
  //   用户实测「上下要贴很近才亮、左右一进即亮」「/tags 下方一定像素就触发」
  //   正是这个换算差异造成的 —— 不是逻辑写错，是**量纲错了**。
  //   改成像素后，任何尺寸的元素在四个方向上的触发边界都完全一致。
  //
  // 取值 6px：够容纳指针停在边框正上方（1px 边框 + 亚像素抖动 +
  //   border 的外半像素），又远小于本站最小间距（gap-6 = 24px），
  //   因此不会"跨过空隙点到隔壁卡"。
  const INSIDE_PX = 6;

  // 邻卡后退的开关状态（写进 <html data-focus>，避免每帧重复赋值）
  let focusInside = false;

  function tick() {
    raf = 0;
    // 用户关掉开关后立刻停止运算（事件里已 cancel，这里是双保险）
    if (!liquidEnabled) return;
    if (rectsDirty) refreshRects();

    let moving = false;
    // 本轮是否有任意元素判定为"指针在其内部"
    let anyInside = false;

    // 几何兜底：指针落在视口之外时，物理上不可能在任何元素内。
    // 这一条与上面的 mouseleave/blur 互为保险 —— 事件可能因为
    // 合成事件、iframe、或浏览器差异而漏掉，但坐标永远不会骗人。
    const pointerInViewport =
      clientX >= 0 && clientX <= window.innerWidth &&
      clientY >= 0 && clientY <= window.innerHeight;

    for (const s of surfaces) {
      if (!s.inView) continue;

      const r = s.rect;
      const w = r.width || 1;
      const h = r.height || 1;

      // 指针相对该元素左上角的归一化坐标（允许 <0 / >1，表示在元素外）
      s.tx = (clientX - r.left) / w;
      s.ty = (clientY - r.top) / h;

      // 缓动收敛
      const dx = s.tx - s.px;
      const dy = s.ty - s.py;
      if (Math.abs(dx) > EPSILON || Math.abs(dy) > EPSILON) {
        s.px += dx * EASE;
        s.py += dy * EASE;
        moving = true;
      } else {
        s.px = s.tx;
        s.py = s.ty;
      }

      const style = s.el.style;
      style.setProperty("--mx", `${(s.px * 100).toFixed(2)}%`);
      style.setProperty("--my", `${(s.py * 100).toFixed(2)}%`);

      // ---- 内外判定 ----
      // 【2026-10-02 修：四向灵敏度必须一致，且必须是像素量纲】
      // 旧代码：`Math.abs(s.tx - 0.5) < 0.5 + 0.05`（归一化坐标 + 5% 放宽）。
      // 数学上四向等权，但换算成像素后：宽卡左右放宽 18px、高卡上下放宽 60px、
      // 导航栏上下只放宽 3.25px —— 于是同一份代码在不同元素上表现完全不同，
      // 用户看到的「/tags 下方一点点就触发、左右要到卡里」「/apps 上方触发、
      // 左右下方不触发」全部由此而来。量纲错了，等权没有意义。
      // 现在直接用**像素**比较：四个方向的物理容差完全相同。
      const insideNow =
        clientX >= r.left - INSIDE_PX &&
        clientX <= r.right + INSIDE_PX &&
        clientY >= r.top - INSIDE_PX &&
        clientY <= r.bottom + INSIDE_PX &&
        r.width > 1 &&
        r.height > 1; // 尺寸为 0 的隐藏元素永远不算"内部"

      // 指针在元素内 **且处于活跃状态** → 高光可见；否则淡出，避免"隔空点亮"。
      // 触屏上 pressed 只在按下期间为 true，抬手后高光按 CSS 过渡淡出 ——
      // 这就是触屏的「点击反馈」。
      style.setProperty("--lite", pressed && insideNow ? "1" : "0");
      if (insideNow && pointerInViewport) anyInside = true;
    }

    // ---- 邻卡后退的触发源 ----
    // 只有指针**真正落在某个液态元素内**才进入。指针落在卡片之间的 gap、
    // 标题上、页面空白处，一律不触发 —— 这正是用户报的"隔空全灭"。
    // 注意：这里判的是裸 insideNow，**不含 pressed** ——
    // 邻卡后退是桌面端概念（CSS 侧也包在 hover 媒体查询里），
    // 触屏按下时不该让别的卡一起后退。
    if (hasHover && anyInside !== focusInside) {
      focusInside = anyInside;
      if (anyInside) {
        document.documentElement.dataset.focus = "inside";
      } else {
        delete document.documentElement.dataset.focus;
      }
    }

    if (moving) raf = requestAnimationFrame(tick);
  }

  function wake() {
    // liquidEnabled 为 false 时（用户关掉开关）完全不排帧
    if (!liquidEnabled || raf || document.hidden) return;
    raf = requestAnimationFrame(tick);
  }

  const onPointerMove = (e: PointerEvent) => {
    // 已被取消/不可用的指针（例如另一根手指接管）不参与，避免坐标乱跳
    if (e.pointerType === "touch" && !pressed) return;
    clientX = e.clientX;
    clientY = e.clientY;
    wake();
  };

  // ------------------------------------------------------------
  // 指针离开视口 → 清掉「邻卡后退」状态
  // ------------------------------------------------------------
  // 【为什么必须单独处理】
  //   指针移出浏览器窗口后浏览器**不再派发 pointermove**，rAF 循环因没有
  //   新目标值而收敛停止；但 focusInside 已是 true，没有任何一帧会把它改回
  //   false。结果：鼠标从窗口边缘离开后页面会**一直僵在"所有卡都缩着"**，
  //   直到用户把鼠标移回来。这是日常高频操作，必须覆盖。
  //
  // 【为什么不用 pointerleave】
  //   `pointerleave` 不冒泡，且当事件目标是 document 时行为因浏览器而异；
  //   实测把合成的 pointerleave 派发到 document 上，监听器根本收不到
  //   （见 leaveTest 取证：inCard=inside → afterLeave 仍为 inside）。
  //   所以改用两条**一定会触发**的信号：
  //     ① documentElement 的 mouseleave —— 鼠标真正离开文档根元素
  //     ② window 的 blur —— 切标签页 / 点其他窗口失焦
  //   并额外在 tick 里做几何兜底：指针落在视口外就视为不在任何元素内。
  const clearFocus = () => {
    if (!focusInside) return;
    focusInside = false;
    delete document.documentElement.dataset.focus;
  };

  // 【关键】离开视口时不能只清 focus —— 还必须让 tick() 知道
  //   "指针已经不在视口内"，否则 tick 里重新计算出的 anyInside 会基于
  //   上一次的陈旧坐标，又把 focus 写回去。
  //   做法：把坐标挪到视口外（交给 tick 里的 pointerInViewport 兜底），
  //   并主动排一帧让判定真正跑一遍。
  //   实测教训：只 delete dataset 而不排帧，状态会立刻被下一帧恢复
  //   （leaveTest 首轮：afterLeave 仍为 "inside"）。
  const leaveViewport = () => {
    clientX = -1;
    clientY = -1;
    pressed = hasHover; // 桌面端保持活跃标志，退出视口靠坐标兜底
    clearFocus();
    wake();
  };

  document.documentElement.addEventListener("mouseleave", leaveViewport, { passive: true });
  window.addEventListener("blur", leaveViewport, { passive: true });
  // 触摸场景：抬手后指针"离开"了，同样要收起（触屏本不会打开这个状态，属保险）
  window.addEventListener("touchend", clearFocus, { passive: true });
  window.addEventListener("touchcancel", clearFocus, { passive: true });

  // ------------------------------------------------------------
  // 输入源：桌面用 hover，触屏用「按下 + 拖动」
  // ------------------------------------------------------------
  // 【为什么不挂 deviceorientation】曾经监听陀螺仪作为触屏方案，但
  //   · iOS 13+ 必须调 DeviceOrientationEvent.requestPermission()，
  //     在用户手势里申请 —— 我们从未申请过，所以它在 iOS 上**永远不触发**；
  //   · 就算能拿到，陀螺仪给的是"设备朝向"、没有绝对位置，
  //     和触摸点驱动高光会互相打架。
  //   所以改用 Pointer Events：它统一了鼠标 / 触摸 / 笔，
  //   手指位置能直接驱动**同一套**元素级变量 ——
  //   这正是「跨设备统一的材质逻辑」，而不是另发明一套效果。
  //
  // 【2026-10-02 修：手指一移动高光就消失】
  //   现象：按住有高光，手指一动就灭，页面也不跟手。
  //   根因：没设 touch-action → 浏览器把手势判给"滚动" → 发 pointercancel
  //         → pressed 归 false → 高光熄灭。
  //   解法分两半，缺一不可：
  //     ① CSS：html[data-input="touch"] .liquid-surface { touch-action:
  //        pan-y pinch-zoom } —— 垂直滚动/双指缩放仍归浏览器（页面照常动），
  //        横向拖动不再被取消。
  //     ② 这里：用 setPointerCapture 把指针**锁在这个元素上**，
  //        并把 pointercancel 的语义收窄 —— 只有"元素被移除/指针真正离开
  //        文档"才算结束，滚动手势不再被误当成取消。
  if (hasHover) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  } else {
    // 同一时刻只跟踪一根手指：新的 pointerdown 直接接管旧的
    let activeId: number | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (activeId !== null && activeId !== e.pointerId) return; // 已有手指，忽略第二根
      activeId = e.pointerId;
      pressed = true;
      clientX = e.clientX;
      clientY = e.clientY;
      // 捕获：后续 move/up 事件即使手指滑出元素也持续送达本窗口，
      // 且不会被浏览器判给滚动手势而取消。
      try {
        (e.target as Element)?.setPointerCapture?.(e.pointerId);
      } catch {
        // 某些浏览器对不可捕获目标会抛错，忽略即可（不影响主流程）
      }
      wake();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (activeId !== null && e.pointerId !== activeId) return;
      activeId = null;
      pressed = false;
      // 收起邻卡后退状态（触屏下本不会打开，这里是保险）
      if (focusInside) {
        focusInside = false;
        delete document.documentElement.dataset.focus;
      }
      wake(); // 再排一帧，把 --lite 归零
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    // pointercancel 只在"指针从根上消失"时才该结束会话。
    // 注意：触摸被滚动手势抢走时浏览器也会发 cancel —— 我们已经在 CSS 侧
    // 把垂直轴让出去了，剩下的 cancel 基本都是真实的会话终止，
    // 所以这里照常释放，但**不重置坐标**：抬手后高光停在最后一帧的位置淡出，
    // 比"瞬间弹回默认右上角"自然得多。
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
  }

  // 滚动 / 尺寸变化 → rect 失效。滚动过程本身不重测（等下一次 rAF 统一测），
  // 用 passive 监听，绝不阻塞滚动。
  window.addEventListener("scroll", () => { rectsDirty = true; wake(); }, { passive: true });
  window.addEventListener("resize", () => { rectsDirty = true; wake(); }, { passive: true });

  // 切到后台时停止，避免不可见时仍占用 GPU 合成
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!document.hidden) {
      rectsDirty = true;
      wake();
    }
  });

  // 底栏「新版视觉效果」开关：立即生效，并停掉关闭后的无效运算。
  // 关闭时只是不运算 —— 高光的隐藏由 CSS（html[data-liquid="off"]）负责，
  // 因此不需要清理各元素上已写入的内联变量。
  document.addEventListener("liquidprefchange", () => {
    if (liquidEnabled) {
      rectsDirty = true;
      wake();
    } else {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      // 关闭时必须清掉邻卡后退状态，否则页面会僵在"所有邻卡都缩着"的样子
      if (focusInside) {
        focusInside = false;
        delete document.documentElement.dataset.focus;
      }
    }
  });

  collect();
  refreshRects();
  // 首次落位：让高光从默认位置平滑滑到目标，而不是硬跳
  wake();

  // ------------------------------------------------------------
  // 【2026-10-02 关键修复：入场动画期间的 rect 缓存污染】
  // ------------------------------------------------------------
  // 本站每个页面的内容容器都带 .fade-in（animation: fadeUp 600ms），
  // 它会从 translateY(14px) 动到 translateY(0)。
  //
  // 上面那句 refreshRects() 在模块脚本执行时立即跑，正好落在动画**进行中** ——
  // 于是所有 rect 都比最终位置低了最多 14px，而且被缓存下来（rectsDirty=false），
  // 之后只有 scroll / resize 才会重新测量。
  //
  // 后果：`s.rect.top` 比真实位置大 → (clientY - r.top) 偏小甚至为负 →
  // 内外判定在**上边界附近全部误判为"在外面"**，而左右方向因为卡片较宽、
  // 偏差占比较小，看起来"还能正常触发"。
  // 这正是用户反馈的「上下要贴很近、左右一进就亮」「/about 上方要点很近、
  // 下方要贴很远」——不是选择器写错，是**缓存了一份动画中途的坐标**。
  //
  // 修法：等动画结束后强制重测。用 animationend 而不是 setTimeout，
  // 因为前者精确对齐真实结束时刻，也不会在多页/多动画时错过。
  // 同时保留一次兜底定时器：若用户开启了 prefers-reduced-motion，
  // 动画时长被压到 0.01ms，animationend 可能早于本脚本注册 —— 那时
  // 定时器仍能保证至少重测一次。
  let settleRetries = 0;
  function resettle() {
    rectsDirty = true;
    wake();
  }
  document.addEventListener("animationend", (e) => {
    // 只认入场动画，避免被其他装饰动画频繁触发
    if ((e as AnimationEvent).animationName === "fadeUp") resettle();
  }, { passive: true });

  // 兜底：入场动画 600ms，这里在 650ms / 1200ms 各补测一次。
  // 用 lite 的方式（只排一帧）而不是长驻循环。
  const settleTimer = window.setInterval(() => {
    settleRetries++;
    rectsDirty = true;
    wake();
    if (settleRetries >= 2) window.clearInterval(settleTimer);
  }, 650);

  // 暴露给 Astro 客户端路由（若未来启用 view transitions，页面切换后重收集）
  document.addEventListener("astro:page-load", () => { collect(); refreshRects(); wake(); });
}

export {};

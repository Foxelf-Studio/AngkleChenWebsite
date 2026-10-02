// ============================================================
// Liquid Glass · L3 液态跟手层
// ============================================================
// 职责：把「指针 / 陀螺仪」的位置，经缓动后写进**每个液态元素自己**的 CSS 变量。
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
//   3. 每帧只写 transform 之外的自定义属性；且缓动收敛即停 rAF，不空转烧电。
//   4. 页面不可见时停掉。
//
// 【元素级变量契约】（写在宿主元素自身的 style 上）
//   --mx / --my  指针相对该元素的归一化坐标（可为负值或 >100%，表示指针在元素外）
//   --lite       指针是否在该元素内：1 = 在内部，0 = 在外部
//   --sheen-t    元素高光强度（由 CSS 的 html[data-glass] 档位决定，JS 不写）

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
// 「玻璃随内容滚动而变实」是 Liquid Glass「材质响应环境」的核心一条，
// 也是本站此前**唯一完全没有接上的响应源**（scroll 监听只用来让 rect 失效）。
//
// 做法：JS 只写一个 --nav-scrim 到 <html>，CSS 用它叠一层**深色**遮罩。
//   CSS 背景是分层绘制的：background-image 画在 background-color 之上。
//   所以「变实」靠加深色，而不必突破「白玻璃 ≤ 12%」的规范上限。
//
// 【刻意不做模糊半径渐变】backdrop-filter 的模糊值每帧变化 = 每帧重算滤镜，
//   既昂贵，又会在部分 Chrome 版本上闪烁（灯箱那次已确认这个坑）。
//   所以模糊恒定，只渐入深色遮罩 —— 实测已足够把白字对比度救回来。
//
// 附带收益：修掉「亮色图片滚过导航栏时白字读不出来」的老问题。
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
  const hasHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  // 活跃状态：桌面恒为 true（跟随 hover）；触屏只在按住期间为 true。
  let pressed = hasHover;

  let raf = 0;

  // 缓动系数：越小越"粘滞"。这是液态感的来源 ——
  // 高光"追着"指针走，而不是硬贴在指针上。
  const EASE = 0.12;
  // 收敛阈值：所有元素都收敛就停 rAF
  const EPSILON = 0.002;

  function tick() {
    raf = 0;
    // 用户关掉开关后立刻停止运算（事件里已 cancel，这里是双保险）
    if (!liquidEnabled) return;
    if (rectsDirty) refreshRects();

    let moving = false;

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
      // 指针在元素内 **且处于活跃状态** → 高光可见；否则淡出，避免"隔空点亮"。
      // 触屏上 pressed 只在按下期间为 true，抬手后高光按 CSS 过渡淡出 ——
      // 这就是触屏的「点击反馈」。
      const inside =
        pressed && s.tx > -0.05 && s.tx < 1.05 && s.ty > -0.05 && s.ty < 1.05
          ? 1
          : 0;
      style.setProperty("--lite", String(inside));
    }

    if (moving) raf = requestAnimationFrame(tick);
  }

  function wake() {
    // liquidEnabled 为 false 时（用户关掉开关）完全不排帧
    if (!liquidEnabled || raf || document.hidden) return;
    raf = requestAnimationFrame(tick);
  }

  const onPointerMove = (e: PointerEvent) => {
    clientX = e.clientX;
    clientY = e.clientY;
    wake();
  };

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
  //   抬手后 pressed 置 false，高光由 CSS 的 opacity 过渡淡出，
  //   形成触屏上的点击反馈。
  if (hasHover) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  } else {
    window.addEventListener(
      "pointerdown",
      (e: PointerEvent) => {
        pressed = true;
        clientX = e.clientX;
        clientY = e.clientY;
        wake();
      },
      { passive: true }
    );
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const release = () => {
      if (!pressed) return;
      pressed = false;
      wake(); // 再排一帧，把 --lite 归零
    };
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
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
  // （liquidEnabled 与 --nav-scrim 由模块级的监听器先行更新，这里只负责 rAF 的启停。）
  // 关闭时只是不运算 —— 高光的隐藏由 CSS（html[data-liquid="off"]）负责，
  // 因此不需要清理各元素上已写入的内联变量。
  document.addEventListener("liquidprefchange", () => {
    if (liquidEnabled) {
      rectsDirty = true;
      wake();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });

  collect();
  refreshRects();
  // 首次落位：让高光从默认位置平滑滑到目标，而不是硬跳
  wake();

  // 暴露给 Astro 客户端路由（若未来启用 view transitions，页面切换后重收集）
  document.addEventListener("astro:page-load", () => { collect(); refreshRects(); wake(); });
}

export {};

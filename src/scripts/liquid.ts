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
// 「面」标记：只有带这个类的元素参与邻卡后退。
// 与 glass.ts 的 liquidPane 常量、global.css 的 .liquid-pane 必须一致。
const PANE_CLASS = "liquid-pane";
// 实例级退出标记：带了它就不参与后退，但高光照旧。
const PANE_OFF_CLASS = "liquid-pane--off";

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
    isPane: boolean; // 是否为「面」—— 只有面参与邻卡后退（缩小）。
                     // 按钮/标签是"件"，只跟手高光，永不后退。
    lit: boolean;    // 上一帧的高光点亮状态 —— 供滞后判定用（见 LIT_RELEASE_PX）
  }

  const surfaces: Surface[] = [];
  let rectsDirty = true;
  // ------------------------------------------------------------
  // 【2026-10-03 第五～九轮：滑动时高光"闪"—— 五个来回的取证与最终解】
  // ------------------------------------------------------------
  // 现象（用户录屏 Screenrecording_20261003_100458.mp4）：手指匀速拖动页面时，
  //   卡片上的高光在纵向**反复上下跳约 14px**，观感就是"光在闪烁"。
  //
  // 【第五轮：先排除合成触摸环境与录屏污染】
  //   · flicker.mjs：`--lite` 稳定翻转 2 次、无中途熄灭 → 排除"亮灭闪"。
  //   · autocrop.mjs：证实固定采样区会随滚动**切进浏览器地址栏**
  //     （底边在 1009~1153 之间游走）—— 这是本轮踩的**测量陷阱第 5 次**。
  //     改用 vidspec2.mjs 逐帧自适应裁切后，最大跳变 8.19、方向反转仅 1 次。
  //
  // 【第六轮：把 rect↔坐标的跨帧混用钉死】
  //   rectlag.mjs 逐帧同时记录 touchY / 实时 rect / 已写入的 --my：
  //     80  touchY=537  rect.top=263.25  --my=96.48%  实时反算=91.8 ← 不符
  //     81  touchY=537  rect.top=263.25  --my=91.79%  实时反算=91.8
  //     83  touchY=537  rect.top=249.25  --my=91.79%  实时反算=96.5 ← 不符
  //     84  touchY=537  rect.top=249.25  --my=96.48%  实时反算=96.5
  //   同帧 `docTop = rect.top + scrollY` 恒为 542.25（极差 0.00px）——
  //   DOM 读数是**一致快照**，错的是**用了哪一帧的 rect**。
  //   → 根因：tick() 用「本帧坐标 + 上一帧 rect」。
  //     误差 = Δscroll / h = 14 / 298.25 = 4.7%，与实测 96.48% ↔ 91.79% 吻合。
  //   → 为什么以前没暴露：EASE=0.12 把这 4.7% 阶跃摊成 0.56%/帧，看不见；
  //     EASE_TOUCH=1（完全跟手）后误差被**原样搬上屏幕**。
  //     即：这是"完全跟手"放大暴露的**既有 bug**，不是新引入的。
  //   → 第一层修：coordsDirty 标志 + tick 开头强制同帧重测 rect。
  //     抖动从"每帧"降到"偶发"（约每 20 帧一次）。**不够**。
  //
  // 【第七轮：定位到"滚动已应用、touchmove 未派发"的窗口】
  //   evorder.mjs 带时间戳的帧时间线：
  //     raf    4464.8  rect.top=277.25  scrollY=265  --my=91.79%
  //     scroll 4465.8                   scrollY=279   ← 滚动先到
  //     raf    4465.9  rect.top=263.25  scrollY=279  --my=91.79% ← 没跟上
  //     raf    4491.6  rect.top=263.25  scrollY=279  --my=96.48% ← 26ms 后才纠正
  //   → 浏览器一帧内的顺序是
  //       [合成器应用滚动] → [派发 scroll/rAF] → [派发 input 事件]
  //     rAF 正好跑在"滚动已应用、新坐标还没到"的窗口里（29 次 vs 67 次）。
  //
  // 【第八轮：补偿公式被证伪】
  //   试过 `py = clientY - (window.scrollY - coordScrollY)`：
  //   反向跳变从约 19 次/秒降到 0，但残留 87.09% ↔ 91.79% 偶发跳变。
  //   scrollread.mjs 在 touchmove 处理器里同时记录 `window.scrollY` 与
  //   **下一帧 rAF 里的 scrollY**：
  //       delta = 0  （处理器里已是新值）: 8 次
  //       delta = 14 （处理器里还是旧值）: 16 次
  //   → `window.scrollY` 在事件处理器里读到的是新是旧**本身不确定**，
  //     任何"时间差补偿"必然约 1/3 次数补错。**补偿这条路走不通。**
  //
  // 【第九轮（最终解）：采集坐标的那一刻就锚定】
  //   不再做任何时间差补偿 —— 在事件处理器里**紧挨着**读 clientX/clientY
  //   和 rect，两者天然同一时刻；当场算出元素相对归一化坐标存进
  //   s.tx / s.ty。之后无论页面怎么滚、tick 何时跑，都不再漂。
  //   → `snapCoords()` 就是这件事。tick 只负责缓动 + 写 CSS，不再碰 rect。
  //   → 判定（lit / pane）也一并改成**归一化坐标比较**：
  //     rect 与 s.tx/s.ty 是同一组值，拿屏幕坐标 px/py 去比 r.left/r.top
  //     等于把"差一个滚动量"的错误在判定上重演一遍。
  //     像素容差按元素尺寸换算成归一化容差（ex/ey），
  //     四个方向的**物理**容忍度仍然一致。
  //   → 代价：处理器里多几次 getBoundingClientRect（全站 .liquid-surface
  //     最多 10 个），且是**连续的批量读**（中间无写），不构成 layout
  //     thrashing；事件本身每帧至多一两次，量级完全可接受。
  //     换来的是**彻底确定**的高光位置 —— 这比省几次读重要得多。
  //
  // 【顺带修掉一个隐患】旧写法 rectsDirty 只在 scroll/resize 置位，
  //   一旦滚动结束而 rect 恰好差一帧，高光位置会**永久偏一点**，
  //   直到下一次滚动才纠正。改为"采集即锚定"后这个残留也消失了。
  //
  // 【为什么滚动帧不必重锚】手指没动、页面在滚时，手指在**文档坐标**里
  //   本就没动 → 相对元素的归一化坐标 s.tx/s.ty 本就不该变，
  //   光应当**跟着内容一起走**（这正是物理上正确的表现）。
  //   所以 scroll 处理器只置 rectsDirty（供 inView 判定），不动坐标。

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
        // 只有显式标了 liquid-pane 的才参与后退。判定只在这里做一次，
        // 不放进每帧循环（classList.contains 每帧调用会累积开销）。
        // liquid-pane--off 是**实例级**退出：外观照用 card，但不参与后退
        // （/about 的信息卡、文章正文页这类独占容器）。
        isPane:
          el.classList.contains(PANE_CLASS) && !el.classList.contains(PANE_OFF_CLASS),
        lit: false,
      });
    });
    rectsDirty = true;
  }

  // 只更新"是否在视口内"的廉价标记 + 缓存 rect（供无坐标时的初始/兜底使用）。
  // 【注意】真正的"坐标↔rect 同帧"由 snapCoords() 保证；
  //   这里刷新 rect 只是为了 inView 判定与初次落位，不参与位移计算。
  function refreshRects() {
    const vh = window.innerHeight;
    for (const s of surfaces) {
      // 一次连续的批量读取（本循环内无任何写），不会触发逐元素的强制同步布局
      s.rect = s.el.getBoundingClientRect();
      // 视口外（含上下各一屏缓冲）直接不参与，省掉无效计算
      s.inView = s.rect.bottom > -vh && s.rect.top < vh * 2;
    }
    rectsDirty = false;
  }

  // 全局指针位置（客户端坐标，像素）—— 唯一的指针状态
  let clientX = window.innerWidth * 0.78;
  let clientY = window.innerHeight * 0.08;

  // ------------------------------------------------------------
  // 【2026-10-03 第九轮（最终解）：采集坐标的那一刻就锚定】
  // ------------------------------------------------------------
  // 五轮取证的完整链条见上方「第五～九轮」长注释（rectlag / evorder /
  // scrollread 三份证据）。结论一句话：
  //   **不要在 tick 里做任何"时间差补偿"** —— 处理器里读到的
  //   `window.scrollY` 是新是旧本身不确定（scrollread.mjs：delta=0 出现
  //   8 次 / delta=14 出现 16 次），补偿必然约 1/3 次数补错。
  //
  // 正解：在事件处理器里**紧挨着**读 clientX/clientY 与 rect，
  //   两者天然同一时刻 → 当场算出元素相对归一化坐标，存进 s.tx / s.ty。
  //   之后无论页面怎么滚、tick 何时跑，都不再漂。
  //
  //   注意：这里读到的是 **rect 与坐标同刻** 的一对值。滚动发生在采集
  //   **之后**时，s.tx/s.ty 保持不变 —— 这是对的：手指在文档坐标里没动，
  //   光就应该跟着内容一起走，而不是在屏幕上原地不动。
  //
  //   tick() 之后只负责缓动 + 写 CSS，不再碰 rect（否则会把 rect 更新到
  //   新的滚动位置，反而与已锚定的 s.tx/s.ty 脱钩）。
  //
  //   代价：处理器里多几次 getBoundingClientRect（全站 .liquid-surface
  //   最多 10 个），且是**连续的批量读**（中间无写），不构成 layout
  //   thrashing；事件本身每帧至多一两次，量级完全可接受。
  //   换来的是**彻底确定**的高光位置 —— 这比省几次读重要得多。
  function snapCoords() {
    for (const s of surfaces) {
      // 每次都重量：元素可能刚进入视口 / 刚被创建
      s.rect = s.el.getBoundingClientRect();
      const w = s.rect.width || 1;
      const h = s.rect.height || 1;
      s.tx = (clientX - s.rect.left) / w;
      s.ty = (clientY - s.rect.top) / h;
    }
    rectsDirty = false;
  }

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
  //
  // 【2026-10-02 分端】桌面端保持缓动；**移动端完全跟手（EASE = 1）**。
  //
  //   桌面端为什么保持 0.12：鼠标会**连续**发 pointermove（120Hz 鼠标
  //   一帧能来好几条），缓动是"平滑"而不是"延迟"，粘滞感恰到好处。
  //   用户明确要求「桌面端保持不变」。
  //
  //   移动端为什么直接取 1（**不做任何缓动**）：
  //   用户先要求「更跟手一些」，调成 0.32（时间常数约 3 帧）后又明确
  //   要求「移动端做成完全跟手吧」—— 即高光与手指**零延迟**。
  //
  //   为什么触屏上"零延迟"才是对的，而不是仅仅更快：
  //     · 手指与屏幕是**直接接触**，用户能看见手指与光斑的每个像素级
  //       相对位移。任何延迟都会被读成"光粘在手指后面"，非常明显；
  //     · 鼠标隔着鼠标垫间接操作，本来就期待"指针 → 反馈"有一点缓冲，
  //       那点延缓反而是质感的来源；这个前提在触屏上**不成立**。
  //     · 移动端本来就伴随页面滚动（手指与光一起动），再叠一层缓动
  //       等于把两种运动错误地混在一起，观感是"光在打滑"。
  //   所以触屏不是"把 0.12 调大一点"，而是**取消缓动这一层**。
  //
  //   技术上安全：EASE = 1 时 `s.px += dx * 1` 一步到位，
  //   下一帧 dx = 0、不再置 moving，rAF 照常收敛停下，不会空转烧电。
  //
  //   桌面端行为完全未变（仍走 EASE_DESKTOP 分支）。
  const EASE_DESKTOP = 0.12;
  const EASE_TOUCH = 1; // 完全跟手：光斑与手指零延迟
  const EASE = hasHover ? EASE_DESKTOP : EASE_TOUCH;
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
  // 【2026-10-02 二次修正：容差从 6px 收回到 0，并区分判定用途】
  //   上一版用 INSIDE_PX = 6 统一外扩，但它同时喂给了**两个语义不同的判定**：
  //     a) 元素自身高光点亮      —— 希望"贴到边缘就亮"，需要一点容差
  //     b) 邻卡后退的触发源      —— 必须是"指针真的落在这一块面上"，零容差
  //   用同一个数，就出现用户报的「指针尚未靠近卡片，就触发了缩小动画」：
  //   相邻两张卡之间只有 24px 空隙，两边各外扩 6px 后，中间 12px 宽的
  //   一条带**同时**属于两张卡的"内部"—— 指针走在缝里就把 focused 打开了。
  //   现在拆成两个常量：
  //     INSIDE_PX  = 0 —— 后退判定：严格 containment，必须指针真在面内
  //     LIT_EDGE_PX = 2 —— 高光判定：只留 2px（边框外半像素 + 亚像素抖动）
  //
  //   2px 的取值依据：本站最小间距是 gap-6 = 24px，但小控件（tagChip）之间
  //   的间距可以是 gap-2 = 8px。2px 外扩在 8px 间距下仍有 4px 中性地带，
  //   不会出现"两个相邻标签同时点亮"的粘连。
  const LIT_EDGE_PX = 2;
  // 熄灭滞后：已经点亮后，要再多离开这么多像素才熄灭。
  // 见 --lite 写入处的注释 —— 用来压掉"边界抖动导致高光闪"。
  const LIT_RELEASE_PX = 6;

  // 邻卡后退的开关状态（写进 <html data-focus>，避免每帧重复赋值）
  let focusInside = false;

  function tick() {
    raf = 0;
    // 用户关掉开关后立刻停止运算（事件里已 cancel，这里是双保险）
    if (!liquidEnabled) return;
    // 【2026-10-03 第九轮：tick 不再量 rect，只负责缓动与写 CSS】
    //   坐标已在**采集的那一刻**由 snapCoords() 换算成元素相对坐标
    //   （s.tx / s.ty），与 rect 天然同帧。这里重测只会**破坏**它 ——
    //   因为重测会把 rect 更新到"当前滚动位置"，而 s.tx/s.ty 是按
    //   采集时的 rect 算的，覆盖 rect 后就与 s.tx/s.ty 不再对应。
    //   所以这里只在"既没有坐标、rect 也脏"时才刷新一次
    //   （首次落位 / collect() 之后）。滚动帧只置 rectsDirty，
    //   而 s.tx/s.ty 已锚定 —— 不需要（也不应该）重测。
    if (rectsDirty) refreshRects();

    let moving = false;
    // 本轮是否有任意元素判定为"指针在其内部"
    let anyInside = false;

    // 【2026-10-03 第九轮】彻底删掉 scrollDy 补偿。
    //   第六轮曾在 tick 里用 `clientY - (scrollY_now - coordScrollY)` 把坐标
    //   补到当前滚动位置，反向跳变从约 19 次/秒降到 0；但 scrollread.mjs
    //   证明 `window.scrollY` 在事件处理器里读到的**是新是旧本身不确定**
    //   （delta=0 出现 8 次 / delta=14 出现 16 次）→ 约 1/3 的次数补错，
    //   留下 87.09% ↔ 91.79% 的偶发跳变。
    //   现在改为"采集时即锚定"（见 snapCoords），补偿这一层已无必要，
    //   且留着反而会**二次平移**已经锚定好的坐标 → 必须删除。
    //
    //   clientX/clientY 本身仍要用：视口内外判定（pointerInViewport）
    //   是**屏幕空间**语义，绝不能补偿 —— 补偿过就判错"指针还在不在屏幕上"。
    //   另外它们还是 snapCoords() 的输入（处理器里那次换算的原料）。
    const px = clientX;
    const py = clientY;

    // 几何兜底：指针落在视口之外时，物理上不可能在任何元素内。
    // 这一条与上面的 mouseleave/blur 互为保险 —— 事件可能因为
    // 合成事件、iframe、或浏览器差异而漏掉，但坐标永远不会骗人。
    const pointerInViewport =
      px >= 0 && px <= window.innerWidth &&
      py >= 0 && py <= window.innerHeight;

    for (const s of surfaces) {
      if (!s.inView) continue;

      // rect / tx / ty 都由 snapCoords() 在同一时刻写定 —— 这里只读。
      const r = s.rect;

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

      // ---- 内外判定（两个用途，两套容差）----
      // 【2026-10-03 第七轮：改用归一化坐标判定，不再拿屏幕坐标去比 rect】
      //   原因：rect 与 s.tx/s.ty 是**采集那一刻**的同一组值；而 px/py 是
      //   "当前"的屏幕坐标。滚动后两者已不在同一坐标系 ——
      //   拿 px/py 去比 r.left/r.top 就是第六轮那个"差一个滚动量"的错误，
      //   只是在判定上重演一遍（表现为滚动时高光"进来了又突然灭掉"）。
      //   归一化坐标天然免疫：s.tx 就是"指针相对这个元素"的比例，
      //   无论页面滚到哪，它表达的都是同一个物理关系。
      //
      //   像素容差换算成归一化容差：
      //     水平 ex = LIT_EDGE_PX / 元素宽   竖直 ey = LIT_EDGE_PX / 元素高
      //   这样四个方向的**物理**容忍度仍然是一致的（这正是量纲修正的本意）。
      const ex = LIT_EDGE_PX / (r.width || 1);
      const ey = LIT_EDGE_PX / (r.height || 1);

      // 高光（lit）：允许 2px 外扩 —— "贴到边缘就亮"，不必精确压线。
      //   与 --mx/--my 用的是**同一个点**（s.tx/s.ty），
      //   不会出现"高光已经画在卡片里、判定还说在外面"。
      const litNow =
        s.tx >= -ex &&
        s.tx <= 1 + ex &&
        s.ty >= -ey &&
        s.ty <= 1 + ey &&
        r.width > 1 &&
        r.height > 1; // 尺寸为 0 的隐藏元素永远不算"内部"

      // 后退（pane）：**零容差**严格包含 —— 必须指针真的落在这一块面内。
      // 只有 .liquid-pane（卡片/面板）参与，按钮标签不参与。
      // 注意是 s.isPane（登记时算好），不是裸 isPane —— 后者不存在，
      // 会在第一个元素上抛 ReferenceError，导致本行之后的 --lite 永不写入。
      const paneNow = s.isPane && s.tx >= 0 && s.tx <= 1 && s.ty >= 0 && s.ty <= 1;

      // 指针在元素内 **且处于活跃状态** → 高光可见；否则淡出，避免"隔空点亮"。
      // 触屏上 pressed 只在按下期间为 true，抬手后高光按 CSS 过渡淡出 ——
      // 这就是触屏的「点击反馈」。
      // 【滞后（hysteresis）】点亮用 2px 外扩、**熄灭要求再多离开 6px**。
      //   指针恰好压在某条边界上时，判定可能在 1/0 之间逐帧翻转（"啪"地亮灭）；
      //   而 --lite 是**离散 0/1**，CSS 侧的 500ms opacity 过渡跟不上逐帧翻转
      //   → 直观就是"在闪"。给熄灭留一段死区后，边界抖动不再能翻转状态。
      //   取值 6px：小于 tagChip 间距 gap-2=8px 的一半，不会造成粘连。
      const rx = (LIT_EDGE_PX + LIT_RELEASE_PX) / (r.width || 1);
      const ry = (LIT_EDGE_PX + LIT_RELEASE_PX) / (r.height || 1);
      const litOn = pressed && litNow;
      const stillNear =
        s.tx >= -rx && s.tx <= 1 + rx && s.ty >= -ry && s.ty <= 1 + ry;
      const litValue = litOn || (s.lit && pressed && stillNear);
      if (litValue !== s.lit) {
        s.lit = litValue;
        style.setProperty("--lite", litValue ? "1" : "0");
      }
      if (paneNow && pointerInViewport) anyInside = true;
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
    // 触屏上 pointermove 一旦被浏览器判给滚动就不再派发，
    // 坐标会永久停在按下位置 —— 所以触屏坐标一律走 touchmove
    // （见下方 onTouchMove）。这里只负责鼠标/笔。
    if (e.pointerType === "touch") return;
    clientX = e.clientX;
    clientY = e.clientY;
    // 【关键】就在这一刻把坐标换算成元素相对坐标 —— 与上面两行同帧同刻。
    //   之后无论页面怎么滚、tick 何时跑，s.tx/s.ty 都不再漂。
    snapCoords();
    wake();
  };

  // ------------------------------------------------------------
  // 触屏坐标源：touchmove
  // ------------------------------------------------------------
  // 【2026-10-02 第三轮修：光效"钉在按下位置"，不跟手】
  //
  // 现象（用户实测）：按住有光、也不熄灭，但光停在一开始的落点，
  //   手指移动时它不跟着走。
  //
  // 【根因：滚动接管后 pointermove 断流】
  //   上一轮为了让"滚动时高光不熄灭"，把 pointercancel 改成了容忍。
  //   但容忍只保住了「不熄灭」，没保住「跟手」——
  //   浏览器一旦把触摸判给滚动，就**停止派发 pointermove**，
  //   于是 clientX/clientY 永远是按下那一帧的值，光自然不动。
  //   也就是说：滚动期间「不熄灭」与「跟手」在 pointermove 这一路是
  //   互斥的 —— 拿不到新坐标，就不可能跟手。
  //
  // 【实测证据】（followtest.mjs，向上滑动 12 步）：
  //     pointermove 事件数 = 1   clientY 序列: 285               ← 只有按下那一下
  //     touchmove   事件数 = 9   clientY 序列: 285,267,231,...   ← 完整连续
  //   touchmove 在滚动全程持续派发且带着完整坐标。
  //
  // 【为什么 touchmove 不会拖累滚动】
  //   监听器用 { passive: true } —— 向浏览器声明"我不会
  //   preventDefault()"，因此滚动**不会**等我们处理完才走，
  //   不引入任何滚动延迟。这与"用 preventDefault 抢滚动"是两件事：
  //   我们只是**读**坐标（observer），不是**接管**手势（controller）。
  //
  // 结果：页面照常由浏览器原生滚动（惯性/回弹都正常），
  //       同时高光跟随手指 —— 正是用户要的"两个同时成立"。
  const onTouchMove = (e: TouchEvent) => {
    if (!pressed) return;
    const t = e.touches[0];
    if (!t) return;
    clientX = t.clientX;
    clientY = t.clientY;
    // 同 onPointerMove：采集的那一刻就锚定成元素相对坐标
    snapCoords();
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
    // 用 snapCoords 而不是只置脏标志：它会把 -1 立刻换算成"远在元素外"
    // 的归一化坐标（s.tx/s.ty 变成大负数），判定随之正确关掉高光。
    snapCoords();
    clearFocus();
    wake();
  };

  document.documentElement.addEventListener("mouseleave", leaveViewport, { passive: true });
  window.addEventListener("blur", leaveViewport, { passive: true });

  // 【触摸收尾：必须同时重置 pressed 与 focus】
  //   上面 pointercancel 已改为"宽松"（不熄高光），所以抬手这件事
  //   必须由 touchend 来收 —— 否则高光会在松手后一直亮着。
  //   用 touchend/touchcancel 作为**最终**信号，与 pointerup 互为冗余：
  //   pointerup 在滚动接管时可能被 cancel 顶掉，touchend 一定会来。
  const endTouch = () => {
    if (hasHover) return; // 桌面端不碰（触屏事件在混合设备上可能误报）
    pressed = false;
    // 坐标没变，但 pressed 变了 → 高光要淡出；排帧即可（无需重锚坐标）
    wake();
  };
  window.addEventListener("touchend", endTouch, { passive: true });
  window.addEventListener("touchcancel", endTouch, { passive: true });

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
  // 【2026-10-02 二次修正：手指一动高光就消失（滚动场景）】
  //   现象：按住有高光，手指一移动就灭 —— 移动端滚动页面时尤其明显。
  //   根因链：
  //     指针落在可滚动区域 → 浏览器要把这次触摸判给「滚动」→ 发 pointercancel。
  //   第一版修法用了 setPointerCapture，**这是错的**：
  //     · 捕获会把指针"钉在元素上"，浏览器不再把它算作 scroll gesture，
  //       页面反而滚不动（用户明确要求"页面也正常动"）；
  //     · 更糟的是部分浏览器在页面开始滚动时仍会发 pointercancel，
  //       而我们的 pointercancel→onPointerUp 把 pressed 置 false，高光熄灭。
  //   正确做法（两个都要）：
  //     ① CSS touch-action: pan-y pinch-zoom —— 在**元素**级别就把垂直轴
  //        让给浏览器（不靠捕获，页面天然可滚），只留横向给页面。
  //     ② 这里**不给指针做 capture**，而是把"高光是否可见"与
  //        "手势是否被滚动接管"解耦：滚动接管时浏览器发 pointercancel，
  //        我们**不结束会话**，只把 pressed 保持为 true，让高光继续跟着
  //        最后已知位置；真正的结束信号是 pointerup / touchend。
  //
  // 【关键：pointercancel 的语义要重新定义】
  //   pointercancel 有两种来源，必须区别对待：
  //     a) 浏览器把触摸判给滚动（我们想容忍 —— 高光应继续跟手）
  //     b) 指针真的从系统里消失（设备拔出、手势识别器抢占）
  //   实践上无法区分二者，所以采取**宽松策略**：忽略 pointercancel，
  //   只信 pointerup / touchend / pointerout 里的真实结束。
  //   代价：极端情况下（b）高光会多停留一会儿 —— 但它有 700ms 淡出，
  //   且下一次 pointerdown 会立即重置，观感上完全无感；反过来若因为
  //   一次滚动就熄灭高光，是用户明确报障的问题。两害相权取其轻。
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
      // 按下这一刻就锚定（此时页面尚未滚动，仍与 rect 严格同帧）
      snapCoords();
      // 【刻意不做 setPointerCapture】
      //   捕获虽能保证 pointermove 持续送达，但会把这次触摸从"滚动手势"里
      //   摘出来 → 页面滚不动。用户要的是"高光跟着动、同时页面也正常动"。
      //   正解不是捕获，而是**换坐标源**：滚动期间 pointermove 断流，
      //   但 touchmove 全程持续（实测 9 : 1），所以坐标走 touchmove。
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

    // pointercancel 只做一件事：解除"当前活跃指针"的跟踪（允许下一次
    // pointerdown 重新接管），但**不关掉高光**。理由见上方注释 ——
    // 滚动接管会发 cancel，而此时用户只是想滚页面，不该让高光熄灭。
    const onPointerCancel = (e: PointerEvent) => {
      if (activeId !== null && e.pointerId !== activeId) return;
      activeId = null;
      // pressed 保持 true：高光继续跟着 touchmove 走，
      // 直到 touchend 真正结束。
      wake();
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });
    // 【坐标主源】touchmove —— 滚动全程持续派发且不阻塞滚动
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    // 同时保留 pointermove：部分场景（如触控笔）只有 pointer 事件。
    // onPointerMove 内部已对 pointerType === "touch" 提前 return，
    // 避免与 touchmove 重复写同一坐标。
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  // 滚动 / 尺寸变化 → rect 失效。用 passive 监听，绝不阻塞滚动。
  // 【2026-10-03 第九轮】这里只置 rectsDirty（供 inView 判定），**不动坐标**：
  //   s.tx/s.ty 已在采集那一刻锚定，与"当前 rect"无关。
  //   滚动期间也不需要重锚 —— 手指没动时 s.tx/s.ty 本就不该变
  //   （手指在文档坐标里没动，光应当随内容一起走）。
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

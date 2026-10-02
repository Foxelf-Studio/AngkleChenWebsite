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

  let raf = 0;

  // 缓动系数：越小越"粘滞"。这是液态感的来源 ——
  // 高光"追着"指针走，而不是硬贴在指针上。
  const EASE = 0.12;
  // 收敛阈值：所有元素都收敛就停 rAF
  const EPSILON = 0.002;

  function tick() {
    raf = 0;
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
      // 指针在元素内 → 高光可见；在元素外 → 淡出，避免"隔空点亮"
      const inside =
        s.tx > -0.05 && s.tx < 1.05 && s.ty > -0.05 && s.ty < 1.05 ? 1 : 0;
      style.setProperty("--lite", String(inside));
    }

    if (moving) raf = requestAnimationFrame(tick);
  }

  function wake() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
  }

  const onPointerMove = (e: PointerEvent) => {
    clientX = e.clientX;
    clientY = e.clientY;
    wake();
  };

  // 陀螺仪：桌面端没有此 API，会自动跳过。
  // iOS 13+ 需用户手势授权，拿不到就保持默认光位（静默降级）。
  // 注意：陀螺仪给的是"设备朝向"，没有绝对指针位置，
  // 因此映射为「页面级」方向向量，再叠加到各元素的相对坐标上。
  let orientX = 0.78;
  let orientY = 0.08;
  const onOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    orientX = Math.min(1, Math.max(0, (e.gamma + 90) / 180));
    const beta = Math.min(45, Math.max(-45, e.beta));
    orientY = Math.min(1, Math.max(0, (45 - beta) / 90));
    // 用视口尺寸把方向映射回"虚拟指针位置"，复用同一套 per-element 计算
    clientX = orientX * window.innerWidth;
    clientY = orientY * window.innerHeight;
    wake();
  };

  // 桌面/触控板用指针；纯触屏用陀螺仪（避免触屏滚动时高光乱窜）
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  } else {
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
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

  collect();
  refreshRects();
  // 首次落位：让高光从默认位置平滑滑到目标，而不是硬跳
  wake();

  // 暴露给 Astro 客户端路由（若未来启用 view transitions，页面切换后重收集）
  document.addEventListener("astro:page-load", () => { collect(); refreshRects(); wake(); });
}

export {};

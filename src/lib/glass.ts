// Glassmorphism 通用 class 常量（与 glassmorphism-style-guide.md 保持一致）
// Tailwind v4 会自动扫描本文件中的字符串，生成对应工具类
//
// 【铁律 1】页面内的卡片/按钮**不要用 backdrop-filter**：
//   它们背后是纯色 / 平滑渐变的页面底色，模糊根本看不出效果，
//   但模糊核会**越过元素边界采样**，把相邻卡片的亮边框采进来 ——
//   表现为相邻卡片边缘出现一条竖直亮带（宽度约等于模糊半径）。
//   玻璃感改用：半透明白底 + inset 高光/暗缘 + 细边框 表达即可。
//   只有「背后会滚过正文的导航栏」「覆盖在正文上的浮层」这类场景才需要 backdrop-filter。
//
// 【铁律 2】外阴影在静态与 hover 必须**结构一致**（同样的偏移/模糊）：
//   既不加深、也不消失、也不凭空出现。
//
// 【铁律 3】动画只碰 transform / opacity；不要用 height / max-height /
//   grid-template-rows 等布局属性做过渡（逐帧 reflow，移动端掉帧）。
//
// ============================================================
// 【2026-10-02 重要】液态层直接内建进下面四个常量
// ============================================================
// 教训：第一批只在首页的卡片上手动加了 liquid-surface / liquid-sheen，
//   结果 /tags、/apps、/about、/post 全都没有效果 ——
//   "逐个页面手动加"这种模式必然漏。
// 现在把液态类**写进常量本身**：任何页面只要用了 card / btn / tagChip /
//   platformChip，就自动获得跟手高光，不可能再漏。
//   （新增玻璃元素时，请优先复用这四个常量，而不是手写样式。）

export const card =
  "isolate bg-white/8 border border-white/15 rounded-3xl shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)] liquid-surface liquid-sheen";

export const cardHover =
  "hover:bg-white/12 hover:border-white/30 hover:shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const btn =
  "isolate bg-white/10 border border-white/20 rounded-2xl text-white shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 hover:shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] liquid-surface liquid-sheen liquid-sheen--tight";

export const tagChip =
  "inline-block bg-white/6 border border-white/15 rounded-2xl text-white/85 text-xs px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] liquid-surface liquid-sheen liquid-sheen--tight";

export const platformChip =
  "inline-block bg-white/6 border border-[#E4B863]/40 rounded-2xl text-[#E4B863] text-xs px-3 py-1 shadow-[0_0_12px_rgba(228,184,99,0),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-[#E4B863]/60 hover:shadow-[0_0_12px_rgba(228,184,99,0.18),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] liquid-surface liquid-sheen liquid-sheen--tight";

export const trans =
  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

// ============================================================
// Liquid Glass 扩展层（beta/liquid-glass）
// ============================================================
// 【设计原则】"液态感"由「指针跟手的高光」承担，不由模糊承担。
//   —— 所以下面这些常量**全部不含 backdrop-filter / filter:url()**，
//      继续遵守本文件开头的三条铁律，从物理上排除「相邻卡片亮带」。
//
// 【变量契约】由 src/scripts/liquid.ts 在**各元素自身**的 style 上写入：
//   --mx / --my  指针相对该元素的归一化坐标（0%~100%），经 lerp 缓动 → 高光"追着"指针走
//   --lite       指针是否在该元素内（1/0），元素外时高光淡出
//   --sheen-t    高光整体强度（0~1），由 html[data-glass] 档位决定

/** 高光跟随层：叠在玻璃表面之上的一枚椭圆光斑
 *  - 用 ::after 承载，避免污染元素自身 background-image（card 已占用）
 *  - mix-blend-mode: screen 让高光只做「加光」，不改变底色相位 */
export const liquidSheen = "liquid-sheen";

/** 元素开启跟手能力的门闩：JS 只负责写变量，样式全在这两个 class 里 */
export const liquidTarget = "liquid-surface";

/** 紧凑高光半径修饰：小控件（按钮/chips）搭配 liquidSheen 使用，
 *  避免大半径光斑把整个小元素点亮成一块白 */
export const liquidTight = "liquid-sheen--tight";

/** 便捷组合：卡片类元素一次性拿到「开启跟手 + 液态高光」 */
export const liquid = `${liquidTarget} ${liquidSheen}`;

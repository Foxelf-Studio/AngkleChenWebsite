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

export const card =
  "isolate bg-white/8 border border-white/15 rounded-3xl shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)]";

export const cardHover =
  "hover:bg-white/12 hover:border-white/30 hover:shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const btn =
  "isolate bg-white/10 border border-white/20 rounded-2xl text-white shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 hover:shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]";

export const tagChip =
  "inline-block bg-white/6 border border-white/15 rounded-2xl text-white/85 text-xs px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const platformChip =
  "inline-block bg-white/6 border border-[#E4B863]/40 rounded-2xl text-[#E4B863] text-xs px-3 py-1 shadow-[0_0_12px_rgba(228,184,99,0),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-[#E4B863]/60 hover:shadow-[0_0_12px_rgba(228,184,99,0.18),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const trans =
  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

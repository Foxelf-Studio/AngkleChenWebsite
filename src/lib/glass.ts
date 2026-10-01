// Glassmorphism 通用 class 常量（与 glassmorphism-style-guide.md 保持一致）
// Tailwind v4 会自动扫描本文件中的字符串，生成对应工具类
//
// 【铁律 1】用 backdrop-filter 的玻璃元素带 `isolate translate-z-0`：
//   isolate 创建干净 stacking context，translate-z-0 强制独立 GPU 合成层，
//   规避 Chrome 下 backdrop-filter 的渲染串扰。
//
// 【铁律 2】外阴影在静态与 hover 必须保持**结构一致**（同样的偏移/模糊）：
//   既不加深、也不消失、也不凭空出现。外阴影一旦突变，相邻元素（尤其带 backdrop-blur 的）
//   边缘采样到的背景亮度就会变化，表现为「相邻元素边缘出现一条亮带 / 变白」。
//
// 【铁律 3】小尺寸元素（标签 chip 之类）不要用 backdrop-blur：
//   模糊效果在小面积上几乎不可见，却很容易在相邻元素重绘时被采样出亮边。
//   用 半透明底 + 边框 + inset 高光 表达玻璃感即可。

export const card =
  "isolate translate-z-0 bg-white/8 backdrop-blur-[60px] border border-white/15 rounded-3xl shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)]";

export const cardHover =
  "hover:bg-white/12 hover:border-white/30 hover:shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const btn =
  "isolate translate-z-0 bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-2xl text-white shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 hover:shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]";

export const tagChip =
  "inline-block bg-white/6 border border-white/15 rounded-2xl text-white/85 text-xs px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const platformChip =
  "inline-block bg-white/6 border border-[#E4B863]/40 rounded-2xl text-[#E4B863] text-xs px-3 py-1 shadow-[0_0_12px_rgba(228,184,99,0),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-[#E4B863]/60 hover:shadow-[0_0_12px_rgba(228,184,99,0.18),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const trans =
  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

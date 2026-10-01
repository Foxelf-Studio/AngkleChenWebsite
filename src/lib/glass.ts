// Glassmorphism 通用 class 常量（与 glassmorphism-style-guide.md 保持一致）
// Tailwind v4 会自动扫描本文件中的字符串，生成对应工具类
//
// 【铁律】所有用 backdrop-filter 的玻璃元素都必须带 `isolate translate-z-0`：
//   - isolate：创建干净的 stacking context
//   - translate-z-0：强制独立 GPU 合成层
//   二者共同规避 Chrome 下 backdrop-filter 的渲染串扰（如「半透明元素变白」）
//
// 【铁律】hover 不要「加深深色外阴影」，也不要让外阴影突然消失（有→无），
//   外阴影的突变同样会触发相邻元素的渲染串扰。静态与 hover 保持外阴影一致，只变内阴影。

export const card =
  "isolate translate-z-0 bg-white/8 backdrop-blur-[60px] border border-white/15 rounded-3xl shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)]";

export const cardHover =
  "hover:bg-white/12 hover:border-white/30 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const btn =
  "isolate translate-z-0 bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-2xl text-white shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 hover:shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:-translate-y-0.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]";

export const tagChip =
  "isolate translate-z-0 inline-block bg-white/6 backdrop-blur-[30px] border border-white/15 rounded-2xl text-white/85 text-xs px-3 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const platformChip =
  "isolate translate-z-0 inline-block bg-white/6 backdrop-blur-[30px] border border-[#E4B863]/40 rounded-2xl text-[#E4B863] text-xs px-3 py-1 shadow-[0_0_12px_rgba(228,184,99,0),inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-[#E4B863]/60 hover:shadow-[0_0_12px_rgba(228,184,99,0.18),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

export const trans =
  "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

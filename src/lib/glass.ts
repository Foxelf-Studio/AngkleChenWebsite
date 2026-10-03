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
// 【铁律 4（2026-10-02 新增）】卡片/按钮的 hover **不做位移**。
//   原本卡片与按钮都带 `hover:-translate-y-0.5`（上浮 2px）。用户明确要求
//   「把卡片上移去掉」—— 因为卡片上浮会与「邻卡后退（缩小）」同时出现，
//   屏幕上是一张往上飘、其余往里缩，两种位移方向打架，空间关系读不出来。
//   液态玻璃表达「当前操作层」应该用**单一**手段：焦点元素保持不动、
//   其余元素整体后退。「悬浮」这件事交给高光与阴影，不交给位置。
//
// 【铁律 5（2026-10-02 新增）】「面」与「件」必须分级，后退只作用于「面」。
//   旧实现把 card / btn / tagChip / platformChip 全部标成 liquid-surface，
//   而邻卡后退的选择器又是 `.liquid-surface:not(:hover)` —— 于是一张卡片被
//   hover 时，**卡片内部的标签、下载按钮也被当成"邻卡"一起缩小变暗**。
//   用户截图里 /apps 的「实用工具」「Windows」标签与「下载」按钮
//   同时变暗变小，就是这样来的。
//   现在分两级：
//     · liquid-pane   —— 参与「邻卡后退」的大面积容器（卡片、面板）。
//                        同一时刻只允许一个 pane 处于焦点，其余整体后退。
//                        嵌套的 pane 通过祖先排除，绝不互相踩。
//     · liquid-surface —— 只要「高光跟手」，**永不缩小**（按钮、标签、
//                        导航栏、开关）。它们是卡片里的零件，不是卡片。
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

// 卡片是「面」：既跟手高光，又参与邻卡后退。
export const card =
  "isolate bg-white/8 border border-white/15 rounded-3xl shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)] liquid-pane liquid-surface liquid-sheen";

export const cardHover =
  "hover:bg-white/12 hover:border-white/30 hover:shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.32),inset_0_-1px_0_rgba(2,6,16,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]";

// 按钮是「件」：只跟手高光，绝不因为别的卡片被 hover 而缩小。
export const btn =
  "isolate bg-white/10 border border-white/20 rounded-2xl text-white shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-white/12 hover:border-white/30 hover:shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(2,6,16,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] liquid-surface liquid-sheen liquid-sheen--tight";

// ============================================================
// 主 CTA（唯一香槟金元素）—— 规范 §3.2
// ============================================================
// 【为什么必须存在这个常量】
//   规范 §3.2 早就定义了金色主 CTA token，但代码里**一处都没落地**：
//   首页 Hero 的「看看我做的软件 →」原本用的是无色 `btn`，
//   全站的行动号召因此没有视觉主次 —— 每个按钮都长得一样。
//   「香槟金只用于主 CTA」这条铁律，前提是**主 CTA 真的存在**；
//   没有一个金色 CTA，唯一强调色就等于不存在。
//
// 【铁律遵守】
//   · 透明度：`bg-[#E4B863]/12` —— 与白色玻璃的上限 bg-white/12 同级，
//     hover 到 `/15` 是规范明文给的**唯一豁免**（金色 CTA 的 hover）。
//   · 外阴影静态与 hover **结构一致**（同样偏移/模糊），只调 inset 亮度，
//     符合铁律 2「外阴影必须结构一致」。
//   · 文字用 `text-[#F3DCA8]`（香槟金的浅色调）而非纯白 ——
//     保证在金色半透明底上仍有足够对比度，且与金色同色系不割裂。
//   · 不做位移（铁律 4），只用 `active:scale-[0.97]` 给按压反馈。
export const cta =
  "isolate bg-[#E4B863]/12 border border-[#E4B863]/40 rounded-2xl text-[#F3DCA8] shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)] hover:bg-[#E4B863]/15 hover:border-[#E4B863]/60 hover:shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(2,6,16,0.3)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] liquid-surface liquid-sheen liquid-sheen--tight";

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

// ============================================================
// 局部关闭「邻卡后退」
// ============================================================
// 【为什么需要这个开关】
//   `card` 常量默认带 liquid-pane（卡片是"面"，参与相邻后退），
//   但有些卡片是**独占一屏的信息容器**（/about 的个人介绍、文章正文页），
//   页面上它没有"同层邻居"，退位动画没有对象、只会让自己读起来在抖。
//   用户原话：「/about 中那个卡片是展示信息的，不用做退位动画，
//   只需要有个光跟着指针就行了。」
//
// 【做法】不动 card，只在这个**实例**上追加一个反向标记。
//   CSS 侧用 `.liquid-pane:not(.liquid-pane--off)` 把该实例摘出去，
//   高光（liquid-surface）完全不受影响 —— 光还是跟着指针走。
//   比"另写一套 cardStatic 常量"好在：卡片的外观语言只有一份，
//   将来改 card 不会漏掉静态变体。
export const liquidPaneOff = "liquid-pane--off";

// ============================================================
// 状态组件（空态 / 加载 / 错误）—— 规范 §八
// ============================================================
// 【为什么要有这一组】
//   此前全站没有任何状态组件：文章为空、软件列表为空、标签下无文章、
//   访问了不存在的文章/标签 —— 这些"非正常但有意义"的时刻，页面要么
//   渲染出一片空白，要么直接掉进框架默认 404（纯白页）。
//   用户看到的是"网站坏了"，而不是"这里暂时没有内容"。
//
// 【材质约束（与 card 同语言，不引入新材质）】
//   1. **不带 backdrop-filter** —— 状态面板背后是页面底色（纯色/平滑渐变），
//      模糊零收益、全副作用（模糊核越界采样会让相邻元素边缘出现亮带）。
//      玻璃感仍由"半透明白底 + inset 高光/暗缘 + 细边框"表达。规范 §八
//      原示例里的 `backdrop-blur-[60px]` 已同步删除（详见 §八）。
//   2. **不带 liquid-pane** —— 状态面板通常独占一屏、没有"同层邻居"，
//      邻卡后退没有对象。两个以上状态并排的场景（如错误页里的"重试 + 返回"）
//      也用不到后退动画，保持安静。
//   3. **带 liquid-surface + liquid-sheen** —— 高光仍然跟手（诚实材质）。
//
// 【尺寸纪律】statePanel 默认按内容宽度自适应，调用方用 `max-w-*` 收窄即可。

/** 空态 / 错误态面板：居中玻璃容器 + 放宽的留白 */
export const statePanel =
  "isolate bg-white/8 border border-white/15 rounded-3xl shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)] [background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)] liquid-surface liquid-sheen";

/** 状态区文案：说明句，比正文更弱、比标题更淡 */
export const stateText = "text-white/50 text-sm leading-relaxed";

/** 状态区标题：仍用玻璃语言的白字，不使用香槟金（金色只留给主 CTA / 关键数字） */
export const stateTitle = "font-semibold text-white text-xl md:text-2xl";

/** 骨架屏基元：低透明白块，配合 animate-pulse 做"加载中"信号 */
export const skeleton =
  "animate-pulse bg-white/6 border border-white/10 rounded-2xl liquid-surface liquid-sheen liquid-sheen--tight";

/** 骨架屏里的高光条：一条更亮的窄条，暗示"内容即将填充" */
export const skeletonBar =
  "animate-pulse bg-white/10 rounded-full";

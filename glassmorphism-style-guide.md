# Glassmorphism（玻璃拟态）设计规范 · 修订版 v1.2

> 本文档由「概览/视觉系统版」与「Hard Prompt 版」合并，并持续修复自审发现的问题。
> 作用：作为风格的**唯一事实源**。实现前统一理解，交付后逐条自检。
>
> 冲突裁决原则：本修订版已显式统一所有冲突点；若仍有歧义，以「禁止项」为最高优先级，其次以「交付检查清单」为准。

---

## 一、核心原则（风格宪法）

玻璃拟态的本质是**光学，不是配色**。真实的玻璃没有颜色——它只借用、弯曲、柔化背后的光。这是 Apple 在 Liquid Glass 材质规范里坚持的原则：玻璃从内容层取色，自己保持中性。

由此推导出五条不可违背的铁律：

1. **玻璃无色**：面板只用白色低透明度（5%–12%），所有颜色来自背景场景。（**唯一豁免**：主 CTA 按钮允许香槟金，见 3.2。）
2. **深色夜景**：背景是接近黑的深墨蓝场景，配 2–3 个柔和光源（light wells），玻璃才有东西可折射。
3. **光有方向**：顶边受光（inset 高光）+ 底边背光（inset 暗缘），这是真玻璃与「半透明色块」的分界线。
4. **唯一强调色**：香槟金 `#E4B863` 只出现在主 CTA、关键数字和高亮文字，绝不大面积铺色。
5. **颗粒质感**：叠加 2%–3% 噪点，消除塑料感。

---

## 二、调色板（按角色，而非笼统的 "Accents"）

| 角色 | 值 | 用途 |
| --- | --- | --- |
| 背景主色 | `#0B1322` | 深墨夜景底色，全局 |
| 光源 · 月光蓝 | `#33517A` | 背景左下光斑 |
| 光源 · 月光 | `#7C9CC4` | 背景右上光斑 / 图表线 |
| 强调 · 香槟金 | `#E4B863` | 主 CTA、关键数字、高亮文字（唯一强调色） |
| 强调 · 浅金 | `#F3DCA8` | 香槟金元素上的文字/图标 |
| 文字 | `white` 各透明度 | 见下方「排版系统」 |

背景底色配方（固定模板，替换时勿移除光源）：

```css
background-color: #0B1322;
background-image:
  radial-gradient(640px circle at 85% 10%, rgba(124,156,196,0.25), transparent 60%),
  radial-gradient(560px circle at 10% 90%, rgba(51,81,122,0.30), transparent 60%),
  radial-gradient(480px circle at 50% 55%, rgba(228,184,99,0.08), transparent 60%);
```

---

## 三、Token 字典（精确 Class 映射）

### 3.1 玻璃面板（卡片 / 区块 / 导航 / 页脚通用基底）

```
bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%]
border border-white/15 rounded-3xl
shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)]
[background-image:linear-gradient(to_bottom,rgba(255,255,255,0.12),transparent_50%)]
```

- 允许透明度区间：`bg-white/5` ~ `bg-white/12`。**任何静态或临时态（含 hover/focus/active）都不得超过 `bg-white/12`**，杜绝 `bg-white/15` 及以上的实心化。
- 模糊值：面板/卡片/导航/页脚用 `backdrop-blur-[60px]`，小型浮层（下拉、tooltip）用 `backdrop-blur-[40px]`；**必须成对出现 `backdrop-saturate-[180%]`**。
- 圆角只允许 `rounded-2xl`（小控件）或 `rounded-3xl`（面板/卡片）。
- 每个面板必须同时具备：外层深阴影 + `inset` 顶部高光 + `inset` 底部暗缘（光有方向）。此规则对 chips 等小徽章同样适用。

### 3.2 按钮

```
bg-white/10 backdrop-blur-[40px] backdrop-saturate-[180%]
border border-white/20 rounded-2xl text-white
shadow-[0_4px_16px_rgba(3,7,18,0.45),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)]
hover:bg-white/12 hover:border-white/30 hover:-translate-y-0.5
hover:shadow-[0_10px_32px_rgba(3,7,18,0.55),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(2,6,16,0.3)]
active:scale-[0.97]
transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
```

- **主 CTA（唯一香槟金元素，也是「玻璃无色」铁律的唯一豁免）**：`bg-[#E4B863]/12 border-[#E4B863]/40 text-[#F3DCA8]`；hover 时 `hover:bg-[#E4B863]/15 hover:border-[#E4B863]/60`。金色只用于 CTA 按钮，其余按钮一律无色玻璃。

### 3.3 输入框

```
bg-white/6 backdrop-blur-[40px] backdrop-saturate-[180%]
border border-white/15 rounded-2xl text-white placeholder-white/35
shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)]
focus:outline-none focus:border-white/35 focus:bg-white/10
focus:shadow-[0_0_0_3px_rgba(228,184,99,0.15),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(2,6,16,0.3)]
transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
```

- 输入框是**唯一**用 `focus:`（鼠标点击与键盘都触发高亮）的控件，因为点击输入框本就该有视觉反馈；其余控件统一用 `focus-visible:`（仅键盘触发）。

### 3.4 焦点环（全局统一）

所有非输入框的可交互元素（按钮、链接、chips、卡片）键盘焦点态统一为
**白色焦点环，画在元素「外侧」**（与上一版不同，见下方修订记录）：

```
:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.85);  /* 白环 */
  outline-offset: 4px;                            /* 向外偏移，与元素留出暗缝 */
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.12); /* 外圈柔光（纯附加） */
}
```

**为什么是白色而不是香槟金**（2026-10-03 修订）：
- 用户取舍原话：「那个液态玻璃开关的金色光晕不是被我改成白色高光了吗，我说我想要朴实一点」。
  —— 金色光晕在深色页面上过于"抢眼/品牌化"，键盘连续 Tab 时到处闪金光很吵；
  白色低透明度环更接近系统 UI 的**朴实**焦点语言。
- 因此 §2 调色板中「香槟金只用于主 CTA / 关键数字 / 高亮文字」的定位不受影响，
  焦点环**不再**占用香槟金。
- 历史背景：本条原为 `0 0 0 3px rgba(228,184,99,0.15)`（金色）。

**为什么环要画在「外侧」而不是紧贴元素**（2026-10-03 二次修订）：
- 第一版用 `box-shadow: 0 0 0 1px` 画环，它从元素**外边界**生长，
  与卡片的 `border border-white/15` 糊成一条线 → 读起来像"卡片自己变亮了"，
  没有"外框套住元素"的层次感。用户要求对齐 Edge 默认观感（环在元素外，留暗缝）。

**实现铁律（踩坑记录）**：
1. **用 `outline` + `outline-offset`，不要用 `box-shadow` 画环**：
   - `outline-offset` 能向外留出暗缝，形成"元素 → 缝隙 → 白环"的分明结构；
   - 现代 Chromium / Firefox 的 `outline` **会跟随 `border-radius`**，
     圆角卡片上不会画成方框（旧浏览器除外）。
2. **不要写 `border-radius: inherit`**（第一版踩的坑）：那会用**父元素**的圆角
   覆盖元素自身的 `rounded-3xl` → 实测 `borderRadius: 0px`，卡片变直角、
   白环也跟着变方。焦点环**不需要**动 `border-radius`，元素自己的圆角就够了。
3. **`outline` 与 `box-shadow` 是两套独立属性，互不覆盖**：因此不必再抄元素原有
   外阴影 —— 聚焦时 `0 16px 40px` 等阴影**结构不变**，天然满足铁律 2。
   外圈的柔光用一层 box-shadow 补充，但它是**纯附加光晕**，不承载原有阴影。
4. **落全局、不要落 `glass.ts` 常量**：常量方案要求每处手动套用，历史上
   「逐个页面手动加」必然漏（见 §12.1.1 的同款教训）。全局 `:focus-visible`
   让**任何新加的交互元素自动获得**焦点环。
5. **只作用于 `:focus-visible`**：鼠标点击不亮环。否则"朴实的观感"会变成
   满页闪白框。
6. **`sr-only` 控件（如开关的 checkbox）要先摘掉白环**：视觉焦点环应画在
   它的可见载体（轨道）上；否则隐藏盒会漏出细边。

### 3.5 标签徽章（chips）

```
inline-block bg-white/6 backdrop-blur-[30px] backdrop-saturate-[160%]
border border-white/15 rounded-2xl text-white/85 text-xs px-3 py-1
shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(2,6,16,0.3)]
hover:bg-white/12 hover:border-white/30
transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
```

- chips 属于「超小徽章」，豁免 3.1 的面板模糊值，允许降为 `backdrop-blur-[30px]` + `backdrop-saturate-[160%]`；但仍须保留「光有方向」（顶高光 + 底暗缘）。

---

## 四、排版系统

| 层级 | Class | 说明 |
| --- | --- | --- |
| Hero | `font-semibold text-white text-4xl md:text-6xl` | 首屏主标题 |
| H1 | `font-semibold text-white text-3xl md:text-5xl` | 页面标题 |
| H2 | `font-semibold text-white text-2xl md:text-3xl` | 区块标题 |
| H3 | `font-semibold text-white text-xl md:text-2xl` | 卡片/小节标题 |
| 正文 | `text-white/80 text-sm md:text-base` | 默认正文，行宽 ≤ 68 字符 |
| 辅助 | `text-white/60 text-xs md:text-sm` | 元数据、次要说明 |
| 弱化 | `text-white/50 text-xs` | 装饰性/非关键文字（见下） |
| 等宽 | `font-mono text-white/85` | 版本号、代码、关键数字 |

对比度约束（在 `#0B1322` 底上，按 WCAG 公式实测）：
- `white/80` ≈ **12:1**，`white/60` ≈ **7.1:1**，`white/50` ≈ **5.3:1**——三者均已超过 WCAG AA 的 4.5:1。
- 尽管如此，`white/50` 仍只用于**层级弱化**（如时间戳、次要提示），承载关键信息的文字不得低于 `white/60`。这是层级原则，不是对比度合规问题。
- 禁止用颜色单独传递状态（如仅靠变金表达选中）。

---

## 五、间距系统

| 级别 | 值 |
| --- | --- |
| Section | `py-16 md:py-24` |
| 容器 | `px-6 md:px-8` |
| 卡片内边距 | `p-6 md:p-8` |
| 小间距 | `gap-4` |
| 中间距 | `gap-6` |
| 大间距 | `gap-8` |

---

## 六、交互与动效（正向定义，已消除矛盾）

上一版「Hover 要即时」与「禁止快速过渡」存在冲突。本版统一为：

- **统一缓动**：`ease-[cubic-bezier(0.16,1,0.3,1)]`（spring 惯性）。
- **统一时长**：`duration-300` ~ `duration-500`（**禁止 `duration-100` / `duration-150`**）。
- **Hover**：即时但有物理惯性——`hover:-translate-y-0.5` + 边框提升到 `border-white/30` + 阴影加深；不允许缩放（scale）作为 hover 反馈。
- **Active**：`active:scale-[0.97]`（明显压平，有碰撞感）。
- **入场动效白名单**：只允许「位移 + 透明度」组合（fadeUp：`translateY(14px)→0` + `opacity 0→1`，600ms spring）；**禁止**纯 `opacity` 淡入超过 300ms、禁止模糊景深、禁止 `bounce`/`elastic` 缓动。
- **降级**：所有动效必须提供 `@media (prefers-reduced-motion: reduce)` 备选（关闭动效）。

---

## 七、可访问性

- 正文对比度 ≥ WCAG AA（见排版系统）。
- 所有交互元素保留清晰键盘焦点（见 3.4 焦点环）。
- 移动端触控目标：**可点击元素最小 44×44px**；纯展示性 chips 可豁免，但可点击 chips 移动端需 ≥ 44px 高度。
- 尊重 `prefers-reduced-motion`。

---

## 八、状态组件（空态 / 加载 / 错误）

三者共享同一玻璃语言，与按钮/卡片一致，不引入新材质：

```
<!-- 空态 / 错误态：居中玻璃面板 + 弱化说明 + 可选香槟 CTA -->
<div class="bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%]
  border border-white/15 rounded-3xl p-8 md:p-12 text-center
  shadow-[0_16px_40px_rgba(3,7,18,0.5),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(2,6,16,0.35)]">
  <p class="text-white/50 text-sm">{EMPTY / ERROR 文案}</p>
  <button class="[按钮 token] mt-5 px-5 py-2 text-xs">{重试 / 返回}</button>
</div>

<!-- 加载态：低透明度 shimmer 骨架，底色用 glass，高光条用 white/10 -->
<div class="animate-pulse bg-white/6 backdrop-blur-[40px] backdrop-saturate-[180%]
  border border-white/15 rounded-3xl h-28"></div>
```

- 加载态可用 `animate-pulse`（透明度呼吸）作为例外——它不是「柔和淡入」，而是骨架屏的常规信号，但仍须在 `prefers-reduced-motion` 下关闭。

---

## 九、禁止项（匹配即违规，直接重写）

### 禁止的 Class

`rounded-none` · `rounded-sm` · `rounded` · `bg-white` · `bg-black` · `bg-gray-*` · `shadow-none` · `backdrop-blur-sm` · `backdrop-blur` · `duration-100` · `duration-150` · `border-black` · `border-gray-*` · `from-indigo-600` · `via-purple-600` · `to-pink-500`

### 禁止的模式

- 紫粉 AI 渐变背景（`#667eea`、`#764ba2`、`#f093fb` 一类 indigo-purple-pink 组合）
- 纯色平面背景上直接使用（必须有光源或图片，玻璃才有东西可模糊）
- 玻璃透明度 ≥ 15%（`bg-white/15` 及以上，**含 hover/active 临时态**；金色 CTA 的 hover 到 `/15` 是唯一豁免）
- 低模糊值 `backdrop-blur-sm` 或裸 `backdrop-blur`
- 省略 `backdrop-saturate`
- 给玻璃面板本身上色（玻璃无色，颜色属于背景；金色 CTA 是唯一豁免）
- 不透明背景 `bg-white` / `bg-black`
- 快速过渡 `duration-100` / `duration-150`
- `bounce` / `elastic` 缓动曲线
- 渐变文字（`background-clip: text`）
- 单侧粗边框装饰（`border-left`/`border-right` accent stripe）
- 卡片里套卡片（嵌套玻璃卡片）
- 每个 section 标题上方都放 tiny uppercase eyebrow 标签
- 通用组件库的圆角卡片 / 模糊阴影 / 重渐变默认样式泄漏

---

## 十、交付自检清单（逐条打勾）

### Token 检查
- [ ] 面板含 `bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%] border border-white/15 rounded-3xl` + 定向阴影（inset 顶高光 + 底暗缘）
- [ ] 按钮含 `bg-white/10 backdrop-blur-[40px] backdrop-saturate-[180%] border border-white/20 rounded-2xl` 三件套
- [ ] 输入框含 `bg-white/6 backdrop-blur-[40px] backdrop-saturate-[180%]` + 香槟金 focus 环
- [ ] 每个面板都带 `backdrop-saturate-[180%]`（chips 允许 160%）
- [ ] 噪点层（feTurbulence 2%–3%）存在

### 禁止项检查
- [ ] 无 `rounded-none/sm/rounded`、无 `bg-white/black/gray-*`、无 `shadow-none`
- [ ] 无 `backdrop-blur-sm` / 裸 `backdrop-blur`、无 `duration-100/150`
- [ ] 无紫粉 AI 渐变
- [ ] 任何玻璃（含 hover/active）透明度未达 `bg-white/15`

### 风格规则检查
- [ ] 深墨夜景底色 + 2–3 个大半径柔和光斑
- [ ] 玻璃透明度在 5%–12% 之间（含临时态）
- [ ] 光有方向（顶边受光 + 底边背光 + 外层深阴影）
- [ ] 香槟金仅出现在主 CTA / 关键数字 / 高亮文字，无大面积铺色
- [ ] 无 bounce/elastic 缓动、无渐变文字、无单侧粗边框、无嵌套卡片

### 通用交付检查
- [ ] 响应式在手机/平板/桌面稳定，无横向溢出
- [ ] 所有交互元素有清晰焦点、可访问名称、reduced-motion 方案
  - 焦点环为**白色双层环**，且玻璃元素的静态阴影在聚焦后**仍然存在**（未掉阴影）
- [ ] 正文对比度 WCAG AA，行宽 ≤ 68 字符
- [ ] 空态/加载/错误态与按钮、卡片同语言，无新材质泄漏
- [ ] 一眼识别为 Glassmorphism，未混入其他风格模板

---

## 十一、导航栏 / Hero / 页脚骨架（快速起步）

### 导航栏

```html
<nav class="bg-white/8 backdrop-blur-[40px] backdrop-saturate-[180%] border-b border-white/15 px-6 md:px-8">
  <div class="flex items-center justify-between max-w-6xl mx-auto gap-6 h-16">
    <a href="/" class="font-semibold text-white text-lg md:text-xl">{LOGO_TEXT}</a>
    <div class="flex gap-6 text-white/80 text-sm">{NAV_LINKS}</div>
  </div>
</nav>
```

### Hero 区块

```html
<section class="py-16 md:py-24 px-6 md:px-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="font-semibold text-white text-4xl md:text-6xl">{HEADLINE}</h1>
    <p class="text-white/80 text-sm md:text-base max-w-xl mt-6">{SUBHEADLINE}</p>
    <button class="[按钮 token] mt-8 px-6 py-3 text-sm">{CTA_TEXT}</button>
  </div>
</section>
```

### 页脚

```html
<footer class="bg-white/8 backdrop-blur-[60px] backdrop-saturate-[180%] border-t border-white/15 py-16 md:py-24 px-6 md:px-8">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
    <!-- 品牌 / 导航列 / 联系列 -->
  </div>
</footer>
```

---

## 十二、液态层（Liquid Glass Layer）· beta

> 状态：**实验分支 `beta/liquid-glass`，尚未合并上线。** 本节描述其设计意图与约束。
> 核心命题：**"液态感"来自「有粘滞感的跟手高光」，不是来自「更模糊的玻璃」。**
> 模糊参数再怎么调都调不出液态感——那只会得到更糊的磨砂玻璃。

### 12.1 分层架构

| 层 | 载体 | 作用范围 | 实现 |
| --- | --- | --- | --- |
| **L1 光学底座** | 纯 CSS | 全站 | 半透明白底 + 双向边框（上亮下暗）+ inset 顶高光；即原有 3.1/3.2 token |
| **L3 液态跟手** | JS → CSS 变量 | **全站**卡片 / 按钮 / 标签 chips | 指针位置经 lerp 缓动写入元素级 `--mx/--my`，驱动一枚 `screen` 混合的高光斑 |
| **L2 折射** | SVG `feDisplacementMap` | **暂未启用** | 见 12.4 |

**L1 与"背景模糊"彻底解耦**是本层最重要的架构决定。历史上所有「相邻元素亮带」bug 的根源，都是让同一个 `backdrop-filter` 同时承担"光学材质"与"背景模糊"两件事。

#### 12.1.1 液态层必须**内建在 `glass.ts` 常量里**，不得逐页手加

**教训（2026-10-02）**：第一批只在首页的卡片上手动加了 `liquid-surface / liquid-sheen`，
结果 `/tags`、`/tags/[tag]`、`/apps`、`/about`、`/post/[slug]` 全部没有效果——
用户直接指出"为什么只有主页有新效果"。**「逐个页面手动加」这种模式必然漏。**

**现行规则**：液态类写进常量本身，任何页面只要用了常量就自动生效。

| 常量 | 内建 | 高光半径 |
| --- | --- | --- |
| `card` | `liquid-surface liquid-sheen` | 340px（近方形大块） |
| `btn` | `liquid-surface liquid-sheen liquid-sheen--tight` | 110px |
| `tagChip` | 同上 | 110px |
| `platformChip` | 同上 | 110px |

**新增玻璃元素时，一律复用这四个常量，不要手写样式。**
确实需要手写（例如导航栏这类特殊定位元素）时，必须显式带上 `liquid-surface liquid-sheen`
并用 `liquid-sheen--wide`（620px，宽扁容器）或 `--tight`（110px，小控件）。

**已知的有意例外**：`/apps` 页的禁用态占位按钮（"敬请期待"）**不给高光**——
禁用元素发光会给出错误的交互暗示。

### 12.2 L3 跟手高光的约束（硬性）

- **变量必须是「元素级」的**：`--mx/--my/--lite` 写在各元素**自身**的 style 上（由 `src/scripts/liquid.ts` 逐元素计算）。
  **禁止写成全局变量**——全局坐标会被所有元素共享，表现为"一个全局光源把所有卡片一起照亮"，不是液态玻璃。
- **`--lite` 决定点亮与否**：指针在元素内 = 1（高光可见），在元素外 = 0（淡出）。这是"光标下方那块玻璃被照亮"的物理感来源。
- **缓动是高光的灵魂**：`EASE = 0.12` 的 lerp 让光**滞后于**指针。硬跟（直接赋值）看起来像鼠标挂件，缓动跟随才有粘滞感。
- **性能**：全局**单个** `pointermove` 监听 + **单个** rAF 循环；`rect` 缓存复用（非滚动时不重测）避免逐帧强制同步布局；缓动收敛即停 rAF；页面不可见时停。

### 12.3 `backdrop-filter` 铁律增补（第 6 条）

> 完整六条见项目 `MEMORY.md`。第 6 条为液态层新增：

**带 `backdrop-filter` 的元素，其【祖先】绝不能用 `opacity` 做淡入淡出。**

祖先 `opacity < 1` 会形成隔离组 → 子元素 `backdrop-filter` 在整个过渡期间都采不到背景 → **动画播完后、`opacity` 恰好到 1 的那一帧模糊才"啪"地跳出**（一帧硬切）。

- **正解**：容器改用 `visibility` 离散切换（`transition: visibility 0s linear <≥最长子过渡>ms`），淡入淡出交给**元素自身**的 `opacity`。
- **关键区分**：**【祖先】`opacity` 会切断背景采样（必崩）；【元素自身】`opacity` 完全安全**（滤镜先算好、再整体按 alpha 合成，走合成层）——后者是各类 Modal 库的标准做法。
- **不要试图用「过渡模糊半径」绕开**（`blur(0px)`→`blur(20px)`）：部分 Chrome 版本上滤镜过渡会闪烁/跳变，等于把一帧突变的风险从祖先挪到自己身上。且若真要用，起点**必须**是 `blur(0px)`、不能是 `none`（`none ↔ 具体值`无法插值）。

### 12.4 方案 B（SVG 折射）——**正确用法**（v1.2 重大修订）

> ⚠️ **本节曾给出错误结论"导航栏不适合折射"，已推翻。根本原因是当初用错了属性。**

**必须用 `backdrop-filter: url(#滤镜)`，不是 `filter: url(#滤镜)`。**

| 属性 | 作用对象 | 结果 |
| --- | --- | --- |
| `filter: url(#f)` | 元素**自身**的渲染结果（背景色、边框、**文字**） | 文字被推糊、整体发灰。**错误用法** |
| `backdrop-filter: url(#f)` | 元素**背后**的画面 | 背景内容被位移 = **真正的折射**。**正确用法** |

当初用 `filter` 试了两个落点都失败，由此误判"feDisplacementMap 在导航栏没有落点"。
换成 `backdrop-filter` 后一次成功。

**受控验证方法**（推荐复用）：在导航栏后方放一层高对比度条纹
（`repeating-linear-gradient`，`z-index` 低于导航栏），截图对比开/关折射：
- 无折射 → 条纹只是被糊直
- 有折射 → 条纹明显被弯折，而导航文字始终锐利
实测导航栏区域平均色差 **25.40/255**（最大 54.0），确认真实生效。

**参数甜点区**：
- `baseFrequency ≈ 0.008`（波长约 125px）——太小看不出扭曲，太大像信号干扰
- `numOctaves="1"`——对**位移场**完全够用，单八度给出平滑大块起伏，观感更"液态"；
  且 `feTurbulence` 昂贵，导航栏全屏宽且滚动时每帧重算，这里省钱很关键
- `scale` 8~14 克制；> 30 开始"撕开"画面
- 滤镜区域必须外扩（`x/y=-25%`, `width/height=150%`），否则位移出界的像素被裁出硬线

**必须写渐进增强回退**：若浏览器不支持滤镜列表里的 `url()`，**整条声明都会失效**，
必须前置一条纯模糊声明兜底，否则连模糊一起丢：
```css
html[data-glass="full"] .glass-nav {
  backdrop-filter: blur(8px) saturate(160%);                            /* 回退 */
  backdrop-filter: blur(8px) saturate(160%) url(#liquid-refract);       /* 支持则覆盖 */
}
```

**权衡**：折射要可见，模糊就不能太重（这里用 8px，而非原来的 40px）。
代价是亮色内容滚过时导航文字对比度会下降 —— 需要时用 `brightness()` 压暗背景补偿。

### 12.5 降级分级（Graceful Degradation）

由 `src/scripts/liquid.ts` 特性检测后写入 `<html data-glass="…">`。**不靠 UA 嗅探**（不可靠且易误判）。

| 档位 | 触发条件 | 行为 |
| --- | --- | --- |
| `full` | 默认（支持 backdrop + SVG filter，无省流/低内存） | 全开 |
| `lite` | `saveData` 或 `deviceMemory ≤ 4` | 模糊减半（导航 40→16px、遮罩 20→10px），高光强度 0.7 |
| `static` | `prefers-reduced-motion: reduce` | **保留材质、只关动效**。`reduce` 管的是"动"，不是"美" |
| `fallback` | 不支持 `backdrop-filter` 或 SVG filter | 摘掉模糊，退化为半透明白底 + 边框；固定光位 |

**调试开关**：URL 加 `?glass=full|lite|static|fallback` 可强制档位，用于逐档验收。生产环境不带参数时完全不生效。

### 12.6 底栏顶边：不要造亮边（v1.2 修订）

> **本节修订第十一节「页脚骨架」**。原骨架为 `bg-white/8 ... border-t border-white/15`，
> 在整屏宽面板上会形成一道可见的「亮带」，已废弃。

**问题**：满宽页脚上的 `border-t border-white/15` 形成 1px 亮线。实测亮度剖面——
页脚之上 43、边框线 **88**、页脚内部 59。在整屏宽度上这道硬边非常刺眼。

**关键认知**：**亮边不是能"柔化"的，只能"消除"。**
任何「只在页脚内部变亮」的处理（细线、渐隐高光、渐变底色），都会在边界造出
「比上方亮、也比下方亮」的一条带 —— 那恰恰是要消除的东西。实测把 1px 实线换成
20px 渐隐光晕后，顶边仍有 17 级亮度突跳。

**正解**：
```css
/* 背景从**全透明**起步，边界处与上方无缝，再缓慢爬到 8% */
background-image: linear-gradient(
  to bottom,
  rgba(255,255,255,0) 0px,
  rgba(255,255,255,0.08) 180px,
  rgba(255,255,255,0.08) 100%
);
/* 页脚**不加** backdrop-filter：背后只有 body 平滑渐变，模糊零收益；
   而 backdrop-saturate 会在边界造成颜色台阶（同规则 5） */
```

实测：边界相邻行落差 **45（原 border-t）→ 4（现值）**，边界处 43→43 无缝。

### 12.7 宽扁容器的跟手高光

`.liquid-sheen::after` 的默认半径（340px）是为卡片这类近方形元素设计的。
导航栏等**宽扁容器**必须用 `.liquid-sheen--wide`（620px），否则高光只覆盖一小块。

### 12.8 导航栏底边：保持硬边（mask 方案已撤销）

**现象**：固定导航栏盖住滚动内容时，底边会形成一道「硬切」——
线之上被模糊、线之下锐利，同一行字被拦腰切断。实测该边界垂直亮度跳变约 **63.5 级**。

**⚠️ 先确认这是不是 bug**：**不是**。被盖住的模糊、露出的锐利，分界**就是导航栏底边**，
这是固定导航栏的正确行为。本项目曾两次把「元素外的正常锐利」误判为
「元素内的过滤失效」，最后靠**逐行平均亮度找台阶**定位元素边界才排除。
排查方法见本节末。

**曾尝试的方案（已撤销）：mask 渐隐**
```css
/* 已移除，仅作记录 */
mask-image: linear-gradient(to bottom, #000 0px, #000 50px, transparent 64px);
```
+ 配套把内容容器 `padding-bottom` 设为渐隐高度以补偿视觉重心。

**撤销原因——「柔和边缘」与「内容天然居中」互相牵制**：
渐隐会让玻璃的**可见区域**变短（只到 50px），视觉中心从 32 上移到 25，
而内容仍居中在 32 → logo 看起来偏低。补偿内容位置后，
「补偿过的居中」在观感上仍不如「几何居中」自然，等于用一个问题换另一个问题。

三阶段实测 logo 中心位置：

| 阶段 | logo 中心 y | 说明 |
| --- | --- | --- |
| **硬边（当前采用）** | **32.5** | 导航栏几何中心 32 → 精确居中 |
| mask + 内容补偿 | 25.5 | 为配合渐隐故意上移 |
| mask 未补偿 | 39.0 | 明显偏下，即用户反馈的「没有居中」 |

**结论**：底边保持硬边，不做渐隐。

> ⚠️ **排查提示**：若被报「导航栏顶部/底部不模糊」，先确认**元素边界的确切位置**。
> 可靠办法：导航栏底色比页面亮，用**逐行平均亮度找台阶**定位其上下边界，
> 再判断锐利内容究竟在边界之内还是之外。不要凭截图裁切区域直接下结论——
> 裁切范围未知时，y 坐标与 CSS 像素不对应。

### 12.9 用户开关：`data-liquid`

底栏提供「新版视觉效果」开关，让用户自行决定是否启用液态层。

- **与 `data-glass` 正交**：`data-glass` 是自动检测的「能力档位」（设备能跑多好），`data-liquid` 是「用户偏好」（想不想要）。用户关闭时**压过一切档位**，完全还原原有玻璃拟态。
- **必须防 FOUC**：偏好在 `<head>` 用 **`is:inline`** 脚本（不能是模块脚本——模块是 defer 的，执行太晚）于**首次绘制前**写入 `<html>` 属性，否则会先按默认渲染再被纠正，闪一下。
- **关闭时停止运算**：`liquid.ts` 的 rAF 循环要真正停掉，不能空转烧电。高光的隐藏由 CSS 负责，无需清理已写入的内联变量。
- **隐私模式容错**：`localStorage` 抛异常时，开关当次仍应生效，只是不记忆。
- **开关自身也遵循玻璃规范**：玻璃底 6%–12%（关闭 6%、开启 12%，均在 5%~12% 区间内）、双向边框 + inset 顶高光 + 外层深阴影、`min-height: 44px` 触控目标、`focus-visible` 金色焦点环。

#### 12.9.1 开关的状态表达（v1.2 定稿）

**演进过程**（走过的弯路值得记住）：

1. 初版：关 = 8% 白底 / 开 = 12% 白底。**在深色底栏上肉眼几乎分不出**，唯一线索是滑块位置。
2. 第二版：加了「已开启 / 已关闭」状态文字 + 开启态金色光晕环与滑块柔光。
   差异确实明显了（实测平均亮度差 33.8 级），**但被否决**——一个开关不该比内容更抢眼，
   金色也不该用在这里。
3. **定稿：只用两条朴素线索。**

| 线索 | 关闭 | 开启 |
|---|---|---|
| 滑块位置 | 左（`translateX(0)`） | 右（`translateX(22px)`） |
| 明暗 | 轨道底 6%、边框 14%、inset 顶高光 18%；滑块 36% 白（哑光） | 轨道底 **12%**、边框 **30%**、inset 顶高光 **32%**、inset 底暗缘 30%；滑块 **95%** 白 |

实测两态在开关区域的平均亮度差 **24.4 级**、最大单像素差 **198/255** —— 朴素但足够分明。
偏金色像素 **0/2176**，确认无任何金色残留。

**关键约束**：

1. **开启态的明暗直接套用卡片 hover 的配方**（`card` → `cardHover`：底 8%→12%、边框 15%→30%、inset 顶高光 22%→32%）。
   不发明新视觉——「开启」的观感就是「这块玻璃被照亮了」，与站内其它玻璃元素的 hover 语言完全同构。
2. **不用状态文字、不用金色。** 金色只留给主 CTA / 关键数字 / 高亮文字。
   实测证明：只靠明暗也能拉开 24 级差，不需要动用强调色，也不需要额外 UI 元素。
3. **外阴影结构在静态 / hover / 开启三态始终保持一致**（同为 `0 4px 16px rgba(3,7,18,0.45)`）—— 铁律 2，避免通过压暗邻域背景制造「变白」错觉。
4. **两态由 `html[data-liquid="on"]` 驱动，不用 `#liquidToggle:checked`** —— `data-liquid` 在首绘前写好，而 `checked` 要等 defer 模块脚本执行；用 `:checked` 会让偏好为「开」的用户每次加载都先闪一帧「滑块在左」。
5. 语义由 `role="switch"` + `checked` 承担，纯 CSS 视觉不参与无障碍表达。

> ⚠️ **关闭态只允许写 `opacity: 0`。** 曾写过
> `html[data-liquid="off"] .liquid-sheen { position: static }`，其特异性 (0,2,1)
> 压过 `.glass-nav { position: fixed }` (0,1,0)，导致**关掉开关时导航栏失去吸顶**。
> 同理**不可**把 `isolation` 重置为 `auto`——`glass.ts` 的 `card` 常量本身带 `isolate`
> （原设计的一部分），关闭态选择器会把它一并干掉。
> **通用规则**：写「关闭态/重置」CSS 前，先确认特异性不会压过别处更重要的声明。
> 这类问题**读代码发现不了，必须实测尺寸/位置**（当时靠比对 `scrollHeight` 的 65px 差值定位）。


> ⚠️ **实现注意**：Tailwind v4 的工具类位于 `@layer utilities`，**层叠优先级低于普通 CSS 规则**。
> 因此自定义 CSS 里**不要设置 `position`/`display` 这类会被工具类管理的属性**——会静默覆盖掉 `.fixed`/`.absolute`。
> 需要给这类属性兜底时，用 `:where()` 把特异性压到 0（如 `:where(.liquid-sheen) { position: relative }`）。
> 2026-10-01 导航栏 `fixed` 失效、跟着页面滚走，就是这个坑。

---

### 12.10 材质必须「响应环境」——四个响应源

对照 Apple Liquid Glass 的定义（**让 UI 本身成为会响应环境和交互的动态材质**，
而不只是「加一层半透明磨砂玻璃」），本站的响应源现状：

| 响应源 | 实现 | 载体 |
| --- | --- | --- |
| 指针位置 | ✅ `liquid.ts` 元素级 `--mx/--my/--lite`（lerp 缓动） | 全站卡片 / 按钮 / chips |
| 滚动位置 | ✅ `--nav-scrim`（0 → 0.35，140px 内 easeOut） | 导航栏 |
| 触摸位置 | ✅ 触屏走 `pointerdown/move/up`，与桌面共用同一套变量 | 全站（移动端等价语言） |
| 焦点 / 当前操作 | ✅ 非焦点卡片降权（`opacity .42` + `saturate .55`） | 网格容器 |
| 背景内容明暗 | ❌ 未实现（固定白色 alpha，不自适应） | —— |

### 12.11 滚动驱动导航栏「变实」

- **实现**：`background-image: linear-gradient(rgba(3,7,18,var(--nav-scrim)), 同)`
  —— CSS 背景**分层绘制**，`background-image` 画在 `background-color` 之上。
  因此「变实」靠叠**深色**，不必提高白色 alpha（白玻璃被 12% 上限卡死，越不过去）。
- **JS 只写一个变量**，rAF 节流，变化 < 0.004 不写（省掉无意义的样式重算）。
- **刻意不做模糊半径渐变**：`backdrop-filter` 的模糊值逐帧变化 = 逐帧重算滤镜，
  既昂贵、又会在部分 Chrome 版本上闪烁（灯箱那次已确认）。模糊恒定，只渐入遮罩 ——
  实测已足够把白字对比度救回来。
- **附带收益**：修掉「亮色图片滚过导航栏时白字读不出来」。

### 12.12 Modal 打开时内容让位（空间层级）

- 结构：`<div class="page-shell">` 包住 `main` + `footer`；**灯箱必须留在壳外**。
- 效果：`html[data-liquid="on"][data-modal="open"] .page-shell`
  → `transform: scale(0.94) translateY(12px)` + `opacity: 0.55`。
- ⚠️ **`transform-origin` 必须由 JS 设为「当前视口中心」**（`50% ${scrollY + innerHeight/2}px`）。
  长页面（文章页可达数千像素）若用默认的文档中心，滚动到中段再打开灯箱时，
  缩放会把可见内容整体拉偏，看起来像页面在乱跑。
- ⚠️ 页壳**不得包含 `position: fixed` 元素**（transform 会成为它们的包含块）。
- ⚠️ **不要给页壳加常驻 `will-change`** —— 壳高可达数千像素，常驻提升合成层长期占用资源。

### 12.13 触摸驱动：移动端的等价语言

- **Pointer Events 统一了鼠标 / 触摸 / 笔**，所以「手指位置驱动高光」不需要另写一套逻辑，
  复用同一套元素级变量即可 —— 这才是「跨设备统一的材质逻辑」。
- 桌面：`pointermove` 持续跟随（`hasHover` 为真）。
  触屏：`pointerdown` 点亮、`pointermove` 跟随、`pointerup/cancel` 释放
  （`pressed` 置 false → `--lite` 归零 → 由 CSS 的 opacity 过渡淡出，形成点击反馈）。
- **已移除 `deviceorientation` 分支**：iOS 13+ 必须调 `DeviceOrientationEvent.requestPermission()`
  且在用户手势中申请，本站从未申请 → 它在 iOS 上**永远不触发**；
  即便拿到，陀螺仪给的是「设备朝向」、没有绝对位置，会与触摸点互相打架。
- **当前操作层只做「非焦点降权」，不加强焦点元素自身** ——
  层级关系由「谁被突出」表达，而不是给焦点元素叠加更多特效。
  选型时可在「仅自身加强」与「相邻后退」之间二选一，本站采用后者。

---

## 附：修复记录

**v1.0（相对两版原始文档的变更）**
1. 统一透明度边界（5%–12% 合法，15% 违规）。
2. 统一 hover 边框为 `border-white/30`。
3. 补正动效矛盾（300–500ms + spring；入场白名单）。
4. 新增排版系统。
5. 新增组件级 token。
6. 重命名调色板（按角色）。
7. 新增焦点环 token。
8. 补全禁止项。
9. 强化交付检查。
10. 修正 44px 触控目标。

**v1.1（二轮自审修复）**
1. **修复按钮 hover 自相矛盾**：`hover:bg-white/15` 违反自家「≥15% 违规」禁令，改为 `hover:bg-white/12`，并在铁律与禁止项中明确「任何临时态都不得超 12%」。
2. **金色 CTA 落点合规**：静态 `bg-[#E4B863]/12`，仅 hover 到 `/15`，并显式声明为「玻璃无色」铁律的唯一豁免。
3. **chips 模糊值豁免化**：3.1 原「只允许 40/60px」与 chips 的 30px/160% 冲突，现明确 chips 为超小徽章豁免，但保留「光有方向」。
4. **chips 补底暗缘**：原 chips 只有顶高光，违反「光有方向」，已补 `inset_0_-1px_0_rgba(2,6,16,0.3)`。
5. **修正对比度错误数据**：原「white/50 ≈ 4.6:1」计算有误（实测约 5.3:1，已过 AA），据此把「只能装饰」的理由从「对比度不达标」改为「层级弱化」。
6. **统一 focus / focus-visible**：明确输入框用 `focus:`（鼠标+键盘），其余控件用 `focus-visible:`（仅键盘）。
7. **修复输入框 focus 阴影覆盖**：focus 时补回底部暗缘，避免「光有方向」在聚焦态丢失。
8. **补等宽字体 token**：`font-mono text-white/85`（版本号/代码/数字）。
9. **新增状态组件**：空态/错误态/加载态 token，杜绝执行者自行发明材质。
10. **禁止项 gray 家族统一**：`bg-gray-100/900` 扩为 `bg-gray-*` 全家族。

**v1.2（液态层 beta，分支 `beta/liquid-glass`）**
1. **新增第十二节「液态层」**：确立「液态感 = 跟手高光，不是更模糊」的核心命题与三层架构。
2. **新增第 6 条 `backdrop-filter` 铁律**：祖先 `opacity` 会切断后代 `backdrop-filter` 的背景采样，导致动画结束时"一帧跳出"；正解是容器用 `visibility` + 元素自身 `opacity`。
3. **明确方案 B 的适用边界**：`feDisplacementMap` 不得用于承载文字/UI 的容器；且只有元素自身带 `backdrop-filter` 时位移才有意义。据此**放弃导航栏折射**。
4. **新增降级分级定义**（`full`/`lite`/`static`/`fallback`）与 `?glass=` 调试开关。
5. **新增 Tailwind v4 层叠陷阱警示**：自定义 CSS 不得设置 `position` 等被工具类管理的属性，否则静默覆盖 `.fixed`；需用 `:where()` 降级特异性。
6. **补充交互组件**：图片灯箱（Modal）的玻璃语言与降级策略。
7. **`--edge` 变量废弃**：导航栏折射边缘带移除后无消费者，已清理。

**v1.3（液态层缺陷修复，2026-10-02）**

本轮全部由用户实测反馈驱动，共修五处**功能性缺陷**。每条都配了可复现的取证数据，
禁止在后续迭代中"直觉改回"。

1. **内外判定必须用像素，不能用百分比**（12.14）
2. **`rect` 缓存必须避开入场动画窗口**（12.15）
3. **邻卡后退必须由 JS 判定触发，不能用 `:hover` 推断**（12.16）
4. **触屏必须显式协商手势所有权（`touch-action`）**（12.17 取代 12.13 的旧描述）
5. **卡片/按钮 hover 一律不做位移**（12.18）

---

### 12.14 【铁律】内外判定的容差必须用像素量纲

**症状**（用户原话）：
- `/tags`：「指针放到卡片下方一定像素的距离就会触发高光，但在左右两侧及上方，指针必须放到卡片里才有高光」
- `/apps`：「指针在卡片上方一小段距离就触发，左右侧和下方必须到卡片里才触发」
- `/about`：「上方一小段距离触发，下方一大段距离触发，左右侧一定距离也可触发」

**根因**：判定写在**归一化坐标**空间里（`Math.abs(tx - 0.5) < 0.5 + 0.05`），
等价于「在元素外再放宽元素尺寸的 5%」。但 5% 换算成**像素**时随尺寸剧变：

| 元素 | 尺寸 | 左右容差 | 上下容差 |
|---|---|---|---|
| 首页卡片 | 368×260 | 18.4px | 13.0px |
| `/about` 卡片 | 768×490 | 38.4px | 24.5px |
| 导航栏 | 1280×65 | 64.0px | **3.3px** |
| `/tags` 卡片 | 436×170 | 21.8px | **8.5px** |

四个方向的物理容差**天生不等**，与逻辑写得多对称无关。**量纲错了，等权没有意义。**

**正解**：直接用**像素**比较，四向同一个常量。

```ts
const INSIDE_PX = 6;
const insideNow =
  clientX >= r.left - INSIDE_PX && clientX <= r.right + INSIDE_PX &&
  clientY >= r.top - INSIDE_PX && clientY <= r.bottom + INSIDE_PX &&
  r.width > 1 && r.height > 1;   // 尺寸为 0 的隐藏元素永不算"内部"
```

- `6px` 的量级依据：够容纳 1px 边框 + 亚像素抖动；又远小于本站最小间距
  （`gap-6` = 24px），因此不会"跨过空隙点到隔壁卡"。
- **取证基准**：四个页面（`/`、`/tags`、`/apps`、`/about`）实测四向边界
  **全部等于 6.0px**。改动后必须复测这条基线。

### 12.15 【铁律】`getBoundingClientRect` 的缓存必须避开入场动画窗口

**症状**：上一条修完后仍有残余偏差 —— 用 CDP 定点测 `/tags` 卡片上边界时，
`elementFromPoint` 返回卡片本身、`el.matches(':hover')` 为 `true`，
但 JS 算出的 `--my` 是 **`-7.06%`**（负数，即"指针在元素上方"），判定为"在外部"。

**根因**：本站每个页面的内容容器都带 `.fade-in`
（`animation: fadeUp 600ms`，从 `translateY(14px)` 动到 `translateY(0)`）。
`liquid.ts` 在模块脚本执行时立刻 `refreshRects()` 缓存 rect，
**正好落在动画进行中** —— 所有 rect 都比最终位置低了最多 14px，且被缓存
（`rectsDirty = false`），之后只有 `scroll` / `resize` 才会重新测量。

于是 `s.rect.top` 比真实位置大 → `(clientY - r.top) / h` 偏小甚至为负
→ **上边界附近全部误判为"在外面"**。左右方向因卡片较宽、偏差占比小，
看起来"还能触发" —— 这才是"四向不一致"的第二层原因。

**正解**：等入场动画真正结束后强制重测。

```ts
document.addEventListener("animationend", (e) => {
  if ((e as AnimationEvent).animationName === "fadeUp") { rectsDirty = true; wake(); }
}, { passive: true });

// 兜底：prefers-reduced-motion 下动画被压到 0.01ms，
// animationend 可能早于本脚本注册，故补两次定时重测。
const settleTimer = window.setInterval(() => {
  rectsDirty = true; wake();
  if (++settleRetries >= 2) window.clearInterval(settleTimer);
}, 650);
```

**通用教训**：任何"首帧缓存几何量"的优化，都要先问一句
**"此刻页面还在动吗？"**。动画期间的几何快照是**过期数据**，
不是"稍微不准"，而是一个**系统性的固定偏移**。

### 12.16 【铁律】邻卡后退由 JS 判定触发，不得用 `:hover` 推断

**症状**（用户原话）：
- 「鼠标指针放到最新文章那一块区域就全部变暗了，并不是在卡片上才会激活相邻后退」
- 「鼠标指针放在相邻卡片之间时也会出现这样的情况」

**根因**：原实现 `main .grid:hover > *:not(:hover)` 存在三重错误：

1. **触发条件错**：只判 grid 自己被不被 hover。指针落在卡片**之间**的 gap、
   或 grid 的任何空白区域时，grid 依然 `:hover`（`:hover` 在祖先上会传播），
   而 `:not(:hover)` 把所有卡片都选中了 → **整块区域全暗**。
2. **覆盖范围窄**：只作用于 `.grid` 的**直接子元素**，
   `/about`、文章页等非 grid 布局的卡片完全没接上。
3. 只有「变暗」，没有「缩小」。

**为什么不能靠 CSS 修**：`:hover` 的命中判定是"指针坐标落在 border-box 内"，
**不含任何容差**。而"贴到边缘 6px 内算进入"这类容差 CSS 表达不了
（`outline`/`::before` 外扩都会连带改变绘制）。

**正解**：判定权交给 JS，与跟手高光**共用同一套 rect 缓存与同一个内外判定**：

```ts
// 指针真正落在某个 .liquid-surface 内 → 写全局状态
if (hasHover && anyInside !== focusInside) {
  focusInside = anyInside;
  if (anyInside) document.documentElement.dataset.focus = "inside";
  else delete document.documentElement.dataset.focus;
}
```

```css
html[data-liquid="on"][data-focus="inside"] .liquid-surface:not(:hover) {
  transform: scale(0.955);
  opacity: 0.45;
  filter: saturate(0.5);
  transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
              filter 700ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

**触发语义**：只判"指针是否真的在某个玻璃元素内"，**不含 `pressed`** ——
邻卡后退是桌面端概念（CSS 侧同样包在 hover 媒体查询里），
触屏按下时不该让别的卡一起后退。

**量级取值**：`scale(0.955)` 对应约 4.5% 收缩，在 368px 宽的卡上约 16px，
肉眼可辨但不足以破坏栅格对齐。

**取证基准**：
- 指针停在 gap 中点（两卡间 24px 空隙）→ `data-focus` 为 `null`，
  所有 `--lite` 为 `0`，**截图与静止态 MD5 完全相同**
  （`b4c16af18018ec66216621ec9862ee20`）→ 零像素变化。
- 指针在卡片内 → 被指向卡 `scaleX=1, opacity=1`，
  其余卡 `scaleX=0.955, opacity=0.45`。
- 像素差分（idle → hover）变化范围**精确落在三张卡的 x 区间**
  （57–424 / 449–817 / 841–1208），**gap（425–448、818–840）零变化像素**。

### 12.17 【铁律】「环境材质」必须豁免邻卡后退 —— 且注意特异性

导航栏 / 开关轨道等整屏单例的**环境材质**，不是「当前操作层」里的选项，
参与"非焦点后退"在语义上就不对（导航栏没有"相邻"概念）。
不豁免的后果：整条吸顶栏 `scale(0.955)` → 向内缩、边缘露出底色
（实测宽度从 1265 掉到 1208）。

**⚠️ 特异性陷阱**（踩过一次）：退避规则的实际特异性是 (0,4,0)：

```
html[data-liquid][data-focus]  → (0,2,0)
.liquid-surface                → (0,1,0)
:not(:hover)                   → (0,1,0)   ← :not() 取括号内选择器的权重
合计 (0,4,0)
```

所以兜底规则**也必须凑到 (0,4,0)** 才能靠"更靠后"取胜。
只写 `.glass-nav`（(0,3,0)）**压不过**，豁免会静默失效。
做法是给兜底也加上 `:not(:hover)`，而不是动 `!important`
（后者会破坏其他状态覆盖链）。

```css
html[data-liquid="on"][data-focus="inside"] .glass-nav:not(:hover),
html[data-liquid="on"][data-focus="inside"] .liquid-switch__track:not(:hover) {
  transform: none; opacity: 1; filter: none;
}
```

**取证基准**：hover 时导航栏区域（`y < 65`）**变化像素数 = 0**。

### 12.18 【铁律】触屏必须显式协商手势所有权（`touch-action`）

**症状**（用户原话）：「手指按在卡片上会有高光，但当手指移动时就会消失，
我想做成当手指移动时高光也跟着动、同时页面也正常动。」

**根因**：不是"没监听 move"，而是**手势所有权**。
指针落在可滚动区域时，浏览器要决定这次触摸算「页面滚动」还是「元素交互」。
默认（`touch-action: auto`）它判给滚动 —— 一旦认定就发 **`pointercancel`**
收回控制权；`liquid.ts` 收到 cancel 后把 `pressed` 置 false，
于是高光熄灭，且后续 `pointermove` 不再产生任何视觉变化。

**解法不是抢滚动**（那会让页面拖不动），而是**划清界限**：

```css
html[data-input="touch"] .liquid-surface {
  touch-action: pan-y pinch-zoom;
}
```

- `pan-y` → 垂直方向仍归浏览器 → 单指上下滑 = 正常滚页面
- `pinch-zoom` → 双指缩放仍归浏览器 → 无障碍不被破坏
- 其余（横向拖动）→ 交给页面 → 不再触发 `pointercancel`，高光可跟随

这就是"高光跟着动、页面也正常动"的实现方式：**两个手势互不争抢，各管一个轴**。

**必须限定在 `html[data-input="touch"]`**：绝不给鼠标设备加这条，
否则桌面端横向拖动选中文字等行为会被改变。
`data-input` 由 `liquid.ts` 用**能力查询**写入（`matchMedia("(hover: hover) and (pointer: fine)")`），
不用 UA 嗅探 —— 改装机、外接鼠标的平板都能判对。

**配套**：用 `setPointerCapture` 把指针锁在元素上；同一时刻只跟踪一根手指
（新的 `pointerdown` 接管旧的），忽略多指干扰。

**取证基准**（`390×844` 移动视口）：
- 拖动过程中 `--lite` **全程保持 `"1"`**，`--mx` 连续变化
  （`37.71% → 41.92% → 47.59% → 54.22% → 60.88% → 67.54%`）
- 事件序列中 **`pointercancel` 出现 0 次**（此前是致命点）
- 垂直滑动页面 `scrollY` 0 → 165（`verticalScrollWorks: true`）
- 横向滑动页面 `scrollY` 保持 0（不平移页面）

### 12.19 【铁律】卡片/按钮 hover 一律不做位移

卡片的「上浮」用**阴影与高光**表达，不用位置。
原 `cardHover` / `btn` 都带 `hover:-translate-y-0.5`（上浮 2px），已全部移除。

**理由**：卡片上浮会与「邻卡后退（缩小）」同时出现 ——
屏幕上一张往上飘、其余往里缩，两种位移方向打架，**空间关系读不出来**。
表达「当前操作层」应该用**单一**手段：焦点元素保持不动、其余元素整体后退。

用户原话：「我要求把卡片上移去掉也没去」——
注意它源自 `cardHover` 常量里的 `hover:-translate-y-0.5`，
**不是**邻卡后退规则的一部分；两者长期混在一起，排查时容易只看后者。

### 12.20 过渡曲线：700ms 起步，且正视 ease-out 的前置量

用户原话：「卡片变暗和恢复的速度太快，感觉像是突然变化的」。

**数据**：把邻卡从 `opacity 0.45` 恢复到 `1.0`，逐帧采样：

| 时刻 | opacity | 增量 |
|---|---|---|
| 4ms | 0.450 | — |
| 60ms | 0.671 | +0.221 |
| 110ms | 0.809 | +0.138 |
| 168ms | 0.888 | +0.079 |
| 217ms | 0.935 | +0.047 |
| 311ms | 0.975 | +0.019 |
| 497ms | 0.998 | +0.003 |
| 590ms | 1.000 | +0.001 |

**结论**：时长从 500ms 提到 **700ms** 后，整段被摊开、缓出尾巴更长，
观感从"硬切"变为"退下去"。

**但必须承认一个固有特性**：`cubic-bezier(0.16, 1, 0.3, 1)` 是强 ease-out，
**前 60ms 就走完 22% 的量**（0.45 → 0.671），这是曲线形状决定的，
加长时长改不掉。若仍觉突兀，**换曲线**而不是继续加时长 ——
应改用起手更缓的 `cubic-bezier(0.4, 0, 0.2, 1)`（标准 ease-in-out），
它的前段斜率显著更小。**不要**用过渡 `filter` 的方式去补
（逐帧重算滤镜，昂贵）。

### 12.21 【铁律】「面」与「件」必须分级 —— 后退只作用于 `.liquid-pane`

**这是 2026-10-02 第二轮修复的核心，也是本层最容易反复踩的结构性错误。**

旧实现把 `card` / `btn` / `tagChip` / `platformChip` **全部**标成
`liquid-surface`，而邻卡后退的选择器写的是 `.liquid-surface:not(:hover)`。
后果：一张卡片被 hover 时，**卡片内部的标签、下载按钮也被当成"邻卡"
一起缩小变暗**。

用户截图证据（/apps）：指针落在「陈叔叔希沃优化工具」卡片内，
「实用工具」「Windows」两个标签与「下载」按钮同时变暗变小，
"就像是被按下了的状态"。

**语义错误**：零件不是卡片。卡片是「面」（pane），标签与按钮是「件」（part）。

**分级后的契约**：

| 类名 | 语义 | 跟手高光 | 参与邻卡后退（缩小） |
|---|---|---|---|
| `.liquid-pane` | 面（卡片、面板） | ✅ | ✅ |
| `.liquid-surface` | 通用表面（含 pane） | ✅ | ❌（除非同时带 pane） |
| `.liquid-pane--off` | 面，但本实例退出后退 | ✅ | ❌ |

`liquid.ts` 在 `collect()` 时一次性算好 `isPane`，不在每帧循环里判：

```ts
isPane: el.classList.contains("liquid-pane")
     && !el.classList.contains("liquid-pane--off")
```

**另一个必须同时修的镜像问题**：如果「件」也被当成触发源，
指针放在**按钮**上也会让全场卡片后退。
用户原话：「光标放在"看看我做的软件"按钮上时，下面的文章卡片也缩小了」。

所以触发源必须只认 pane：
```ts
const paneNow = s.isPane && clientX >= r.left && clientX <= r.right
                         && clientY >= r.top && clientY <= r.bottom;
```
JS 的 `data-focus` 与 CSS 的 `.liquid-pane:not(...)` **共用同一套判定**，
两者必须同步改 —— 只改一边就会出现"高光跟手但后退不触发"的错位。

**`.liquid-pane--off` 的适用场景**：独占的信息容器，
页面上没有同层邻居，退位动画无对象、只会让自己读起来在抖。
目前用于 `/about` 的介绍卡与 `/post/[slug]` 的正文卡。
用户原话：「/about 中那个卡片是展示信息的，不用做退位动画，
只需要有个光跟着指针就行了」。

**不要用 `.liquid-pane--off` 去关掉整组卡片** —— 网格里的
兄弟卡片（`/`、`/apps`、`/tags`）就应该互相后退，那是本效果的本体。

### 12.22 【铁律】后退判定的容差必须是 **0**，高光判定才允许小外扩

第二轮用户报障：「指针尚未靠近卡片，就触发了缩小动画」——
在主页、/apps、/tags、/about 都存在。

**根因**：上一版用**同一个** `INSIDE_PX = 6` 同时喂给两个语义不同的判定：
- a) 元素自身高光点亮 —— 希望"贴到边缘就亮"，需要一点容差；
- b) 邻卡后退的触发源 —— 必须是"指针真的落在这一块面上"，**零容差**。

相邻两张卡之间只有 `gap-6 = 24px`。两边各外扩 6px 后，
中间 **12px 宽**的一条带**同时**属于两张卡的"内部" ——
指针走在缝里就把 `data-focus` 打开了，全场卡片一起缩小。

**正确做法拆成两个常量**：

```ts
const LIT_EDGE_PX = 2;   // 高光：只留边框外半像素 + 亚像素抖动
// 后退：零容差，严格 containment，不设常量、直接比较
```

`LIT_EDGE_PX = 2` 的依据：本站最小控件间距是 `gap-2 = 8px`，
2px 外扩在 8px 间距下仍留 4px 中性地带，
不会出现"两个相邻标签同时点亮"的粘连。

**实测边界值**（四页一致，改动前是各向 6.0px 且间隙误触发）：

| 页面 | 上 | 下 | 左 | 右 |
|---|---|---|---|---|
| `/` | 6.0px | 6.0px | 6.0px | 6.0px |
| `/tags` | 6.0px | 6.0px | 6.0px | 6.0px |
| `/apps` | 6.0px | 6.0px | 6.0px | 6.0px |
| `/about` | 6.0px | 6.0px | 6.0px | 6.0px |

**通用教训**：**一个容差常量不能服务两种语义**。
凡是要用"外扩 N 像素"的地方，先问它属于「视觉可达性」还是
「逻辑命中」—— 前者可外扩，后者必须精确。

### 12.23 【铁律】触屏的 `pointercancel` 要**容忍**，且不得用 `setPointerCapture`

第二轮用户报障：「滑动屏幕滚动时，高光闪一下就消失了，
具体是按下出现，手指移动就消失」。

**根因链**：指针落在可滚动区域 → 浏览器要把这次触摸判给「滚动」
→ 发 `pointercancel` → 旧代码 `pointercancel → onPointerUp` 把 `pressed`
置 false → 高光熄灭。

**第一版修法是错的**：用了 `setPointerCapture` 想锁住指针。
- 捕获会把指针"钉在元素上"，浏览器不再把它算作 scroll gesture，
  **页面反而滚不动** —— 直接违反用户明确要求「页面也正常动」；
- 更糟的是部分浏览器在页面开始滚动时**仍会**发 `pointercancel`，
  高光照样熄灭。等于两头都没解决。

**正确做法（两个都要，缺一不可）**：

① CSS：在**元素级别**把垂直轴让给浏览器，不靠捕获：
```css
html[data-input="touch"] .liquid-surface {
  touch-action: pan-y pinch-zoom;
}
```
垂直滚动与双指缩放仍归浏览器（页面天然可滚），横向拖动留给页面。

② JS：**重新定义 `pointercancel` 的语义** —— 只解除"当前活跃指针"的
跟踪，**不关掉高光**：
```ts
const onPointerCancel = (e: PointerEvent) => {
  if (activeId !== null && e.pointerId !== activeId) return;
  activeId = null;
  // pressed 保持 true：高光停在最后位置，等下一条 pointermove 继续跟随
  wake();
};
```

③ **必须补上 `touchend` / `touchcancel` 来真正收尾**。
既然 `pointercancel` 已被"宽松化"，抬手这件事就没人管了 ——
若不补，高光会在松手后一直亮着。用 `touchend` 作为**最终**信号
（它也一定会来，与 `pointerup` 互为冗余）：
```ts
const endTouch = () => {
  if (hasHover) return;   // 桌面端不碰（混合设备可能误报触摸事件）
  pressed = false;
  clearFocus();
  wake();
};
window.addEventListener("touchend", endTouch, { passive: true });
window.addEventListener("touchcancel", endTouch, { passive: true });
```

**为什么敢容忍 `pointercancel`**：实践上无法区分「被滚动手势接管」
与「指针真的从系统消失」。两害相权：
- 若因一次滚动就熄灭高光 → 用户明确报障的问题；
- 若极端情况下高光多停留一会儿 → 有 700ms 淡出，
  且下一次 `pointerdown` 立即重置，观感无感。

**实测证据**（390×844 触屏模拟，钉住同一张卡片采样）：

```
初始:   --lite=0
按下:   --lite=1                      ev= pointerdown
拖动中: --lite=1  --mx 持续变化        ev= pointerdown,pointermove,pointermove,pointercancel
抬手:   --lite=0
```

`pointercancel` 出现 1 次而高光**全程保持点亮** —— 正是所需行为。
另测：竖向滑动 scrollY `0→165`（页面照常滚），横向滑动 scrollY 保持 `0`。

### 12.24 【排查陷阱】`ReferenceError` 会让"后半段赋值"静默失效

本轮定位过程中遇到一个极隐蔽的 bug，值得单独记一条。

**现象**：`--mx` 正常写入并跟随指针，但同一段代码里 20 行之后的
`--lite` **永远是空字符串**（连 `0` 都不是）。所有高光全部失效。

**根因**：循环里写成了裸 `isPane`，而变量实际是 `s.isPane`。
`isPane` 未定义 → 抛 `ReferenceError` → 该元素循环体**中断**。
由于 `--mx` 的写入在抛错点**之前**，`--lite` 在**之后**，
于是表现为"一半生效、一半静默失效"。

**为什么难查**：模块级的 rAF 循环里抛错不会冒泡到控制台显眼位置，
且**下一帧仍会重新开始**，所以看起来"动画在跑、只是某个属性没生效"。

**教训**：
- 自定义属性**一个都没写** → 多半是循环前就挂了（选择器/收集阶段）；
- **前几个写了、后面的没写** → 强烈怀疑**中途抛异常**，
  用 CDP `Runtime.evaluate` 逐个属性读 `el.style.getPropertyValue()`
  比看视觉结果快得多（视觉上"高光没亮"会误导到 CSS 侧去查）。
- TypeScript 的 `strict` 未必拦得住这类循环内变量名笔误，
  **`astro check` 要跑**（注意需 `--max-old-space-size=6144`，
  `public/admin` 里 TinaCMS 打包的巨型 JS 会 OOM）。

### 12.25 【铁律】触屏坐标必须走 `touchmove` —— 滚动接管后 `pointermove` 会**断流**

第三轮用户报障：「移动端滑动时光效是有了，也不会消失，但是光效只会
停留在我手指一开始触摸的位置，并没有跟随手指移动」。

**这条是 12.23 的"后半句"**。12.23 修好了「不熄灭」，但漏了「跟手」——
两者在 `pointermove` 这一路上是**互斥**的：

- 12.23 之前：`pointercancel` 一响就熄灭 → 问题是"闪一下就没"；
- 12.23 之后：容忍 cancel，高光保持点亮 → 但坐标**再也没更新过**。

**根因**：浏览器一旦把这次触摸判给**滚动**，就**停止派发 `pointermove`**。
于是 `clientX/clientY` 永远停在按下那一帧 → 光钉在落点不动。
"拿不到新坐标，就不可能跟手"——这不是渲染问题，是**数据源问题**。

**实测证据**（`followtest.mjs`，390×844 触屏模拟，向上滑 12 步）：

```
pointermove 事件数 = 1   clientY 序列: 285, -, -, ...        ← 只有按下那一下
touchmove   事件数 = 9   clientY 序列: 285,267,231,213,177,159,123,105,87
```

`touchmove` 在滚动**全程持续派发**，且坐标完整连续。
**结论：触屏坐标只认 `touchmove`。**

**正解**：
```ts
// 1) pointermove 内部对触屏直接 return，避免与 touchmove 抢写同一坐标
const onPointerMove = (e: PointerEvent) => {
  if (e.pointerType === "touch" && !pressed) return;
  if (e.pointerType === "touch") return;   // ← 触屏坐标一律走 touchmove
  clientX = e.clientX;
  clientY = e.clientY;
  wake();
};

// 2) 新增 touchmove 作为坐标主源
const onTouchMove = (e: TouchEvent) => {
  if (!pressed) return;
  const t = e.touches[0];
  if (!t) return;
  clientX = t.clientX;
  clientY = t.clientY;
  wake();
};
window.addEventListener("touchmove", onTouchMove, { passive: true });
```

**为什么 `touchmove` 不会拖累滚动**：用 `{ passive: true }` 注册 ——
等于向浏览器声明「我不会 `preventDefault()`」，滚动**不必等我们处理完**。
这是**读**坐标（observer），不是**接管**手势（controller）。
`setPointerCapture` 之所以错，正在于它是后者（见 12.23）。

**验证**（`followverify.mjs`，由元素 rect + 百分比反算光的屏幕坐标）：

```
步  手指(clientY)  光屏幕Y   rectTop  手指-光差  scrollY   --my
 0        303       264       243        -39        0    7.6
 4        239       243       194          4       49   17.8
 8        175       177       130          2      113   17.3
10        143       148        98          5      145   18.4

手指屏幕位移 -160px / 光的屏幕位移 -116px / 页面滚动量 145px
最大偏差 9px   光是否跟手: ✅ 是   页面是否滚动: ✅ 是
```

**注意 `--my` 稳定在 17–20% 而不是单调走到底，是正确行为**：
手指每步上移 16px、页面同时滚 16px，手指相对卡片的百分比自然保持稳定，
而屏幕上光则跟着手指走 —— 这正是「两个同时成立」的物理表现。
排查时若误以为「`--my` 必须持续变化才算跟手」会跑偏。

### 12.26 【铁律】背景层禁用 `background-attachment: fixed` 与**百分比定位**的渐变

第三轮用户报障：手机 Edge 滑动时底栏自动收缩，**收缩处出现一条色差带**；
松手时若底栏收缩成功则色差更正，若收缩失败会回弹、恰好盖住色差区域。

**第一层根因：`background-attachment: fixed`**
语义是「背景相对**视口**固定」→ 视口尺寸一变，整片背景就按新视口重铺。
移除它（改用独立的 `.bg-fixed` 层承载）。

**但移除后问题依旧**（实测色差仍有 **18**）—— 说明还有第二层。
**真正的元凶：百分比定位的 `radial-gradient` 圆心。**

背景层高度恒等于视口高（844 → 800 → 760），而圆心写的是
`85% 10%` / `10% 90%` / `50% 55%`。**百分比是相对元素自身盒子解析的**，
盒子高度一变 → 三个光斑圆心全部跟着移动 → 全屏背景亮度整体漂移 →
与「已经画好的页面内容」错位 → 底边露出色差带。

**实测证据**（`viewporttest.mjs`，同一滚动位置 y=500，仅改视口高度，
采样左侧纯背景列 x=60）：

```
视口 844 → rgb(40,48,64)
视口 820 → rgb(38,46,62)   差 6
视口 790 → rgb(37,46,61)   差 8
视口 760 → rgb(33,44,60)   差 15
.bg-fixed 实测高度: 844 / 800 / 760   ← 与视口同变
```

**修法：把"会随视口变"的百分比换成"不动的绝对长度"**
```css
.bg-fixed {
  position: fixed; top: 0; left: 0; right: 0;
  height: 1400px;          /* 定值 px —— 绝不用 vh */
  z-index: -1; pointer-events: none;
  background-color: #0b1322;
  background-image:
    /* 宽度方向用 vw（底栏收缩只改高度、不改宽度） */
    radial-gradient(640px circle at 85vw 140px,  rgba(124,156,196,0.25), transparent 60%),
    radial-gradient(560px circle at 10vw 1260px, rgba(51,81,122,0.3),   transparent 60%),
    radial-gradient(480px circle at 50vw 770px,  rgba(228,184,99,0.08),  transparent 60%);
  /* 高度方向一律 px 定值 */
}
html, body { background-color: #0b1322; }   /* 兜底 */
```

**安全性分析（关键）**：
- `vw` 是**安全**的 —— 底栏收缩只改高度，不改宽度；
- `vh` 是**最危险**的 —— 它正是随底栏变化的那个量，一律禁用；
- 背景层高度必须用 `px` 定值（`min-height: 100%` / `100vh` 都会跟视口变）；
- `body` 也同步去掉 `min-height: 100vh`（移动端 `vh` 普遍包含被工具栏
  遮挡的区域），改 `min-height: 100%`，并在 `html` 上补 `height: 100%`
  建立高度链。

**验证**：最大色差 **26 → 2**，`✅ 背景不随视口高度变化`。

### 12.27 【排查陷阱】采样点不得依赖视口高，否则视口一变就测到不同内容

本轮定位色差带时，第一版脚本用「**截图高度的 70%**」作为采样点。
换视口高度后，这个点落到了**页面的不同位置**，读出「色差 18」的
**假阳性**，把排查带偏了一轮。

**这是同类测量陷阱第二次踩**（上一次是「从元素中心往外量」，
元素本身在动，量出来的"距离"没有可比性）。

**铁律**：
- 采样点必须用**固定页坐标**（或固定元素相对坐标），
  绝不用「视口百分比」「截图百分比」；
- 对比不同视口时**不要滚动页面** —— 滚动会改变可滚动范围，
  把「背景漂移」与「内容移位」两个变量混淆在一起；
- 先问一句：「我这几个数据点，量的是同一个东西吗？」

**第三次踩（2026-10-02 同日，量菜单模糊时）**：拿 nav 的空白列
`x[210,300)` 与面板的空白列 `x[300,360)` 对比 —— 两列**背后的内容不同**，
量出的亮度差 −7.5 里有一半是背景本身造成的。改成 `x[210,300)` 后
（面板同列也是空白），亮度差降到 −1.3。
**推论**：跨元素比较时，先证明「两处背后是同一块内容」，再取数。

### 12.28 【铁律】跨元素比对观感时，必须**同列 + 同一相对行**

承接 12.27。修「菜单与导航栏模糊不一致」时，取样又错了一次：
nav 的可用空白列是 `x[210,300)`（logo 右侧、按钮左侧），
面板的空白列是 `x[300,360)`（链接文字右侧）—— 当时想「两处都是空白就行」，
**但空白不等于同一块背景**，量出的亮度差 −7.5 里有一半是背景差异。

**正解：用"距各自容器顶边的距离"对齐**（面板顶 = 64 = 导航栏高）：

```js
// nav   y[16,46)
// panel y[16+64, 46+64) = [80,110)   ← 同一相对行
// 两处都用 x[210,300)                 ← 同一列
```
改后亮度差 −7.5 → **−1.3**，高频比 1.006。

**同时必须避开文字**：首轮采样撞上了 nav 的 logo 文字，
高频被抬到 29（正文才 13），得出「导航栏比正文还清晰」的荒谬结论。
**文字是高频源，会把"模糊"的结论整个带反。**

### 12.29 【铁律】移动端**完全跟手**（EASE = 1），桌面端保留缓动

用户先要求「移动端的光效设置得更跟手一些吧，桌面端保持不变」，
调成 0.32（时间常数约 3 帧）后又明确要求「移动端做成完全跟手吧」。

**为什么不只是"调大一点"，而是取 1（取消缓动这一层）**：

- **手指与屏幕是直接接触** —— 用户能看见手指与光斑之间**每个像素级**的
  相对位移，任何延迟都会被读成"光粘在手指后面"；
- 鼠标隔着鼠标垫间接操作，本来就期待"指针 → 反馈"有一点缓冲，
  那点延缓反而是质感的来源。**这个前提在触屏上不成立**；
- 移动端本来就伴随页面滚动（手指与光一起动），再叠一层缓动等于
  把两种运动错误地混在一起，观感是"光在打滑"。

所以触屏不是"把 0.12 调大一点"，而是**取消缓动这一层**。

**实测**（`easetest.mjs`，阶跃输入 + 逐帧读 `--mx`）：

```
                到 90% 用几帧    反推 EASE
移动端(触屏)         1 帧          1.000   ← 零延迟
桌面端(鼠标)        20 帧          0.117   ← 保持不变
```

**跟手偏差也一并归零**（`followverify.mjs`，滚动全程）：

```
改前（EASE=0.32）：手指-光偏差序列 -3, 12, 2, 5, 8px   最大 12px
改后（EASE=1.0） ：手指-光偏差序列  0,  0, 0, 0, 0px   最大  0px
```

**技术上安全**：`EASE = 1` 时 `s.px += dx * 1` 一步到位，
下一帧 `dx = 0`、不再置 `moving`，rAF 照常收敛停下，不会空转烧电。

**桌面端一律不受影响**（走 `EASE_DESKTOP` 分支）。

**唯一代价**：触屏失去了"液态追光"那一点点拖尾感 —— 这是用户
在**看过效果后**明确选择的取舍。若将来想找回质感，把 `EASE_TOUCH`
调到 0.6~0.7 即可兼顾（时间常数 ≈1.5 帧，肉眼几乎无延迟）。

### 12.30 【铁律】「同一套玻璃配方」= 同一套**材质语言**，不是同一串参数

用户报障：「展开的菜单和导航栏的模糊效果好像不一致」。

取证（`blurmatch.mjs`，390×844 触屏，菜单展开后）——**三处都不同**：

| | 模糊 | 折射 | 白底 |
|---|---|---|---|
| nav | 8px | ✅ `url(#liquid-refract)` | 12% + scrim |
| 菜单面板 | 40px | ❌ 无 | 8% |

像素级结果：亮度差 **−14.4**、高频比 1.140
→ 菜单明显比导航栏"发透/发暗"，观感就是「一块深色实玻璃 + 一片浅雾」。

**但要小心"把参数调成一样"这个直觉**：

- 面板展开后高 185px，是导航栏的近 3 倍 → **同样的 8px 模糊在大面积上
  知觉上更弱**，看起来像半透明色块，不像玻璃；
- 面板背后**没有滚动的正文**（只有页面顶部那段静态内容），
  所以它不需要导航栏那种"只为糊掉滚动内容"的强模糊。

**正解：统一到同一套材质语言，按面积微调半径**
```
nav      : blur(8px)  saturate(160%) url(#liquid-refract)   白 12% + scrim
菜单面板 : blur(24px) saturate(160%) url(#liquid-refract)   白 12% + scrim
           ↑ 半径不同（面积补偿），其余 100% 一致
```

**关键三件事**（缺一件就"看起来不一样"）：
1. **折射必须两边都有**。玻璃的"厚度"来自折射；面板原来没有，
   这是"质感不一样"的**主因**，比模糊半径的影响更大。
2. **白底浓度对齐到规范上限 12%**，两边一模一样。
3. **共用同一个 `--nav-scrim`**。菜单展开时页面通常已滚动过、导航栏已变实；
   若面板不跟着变实，衔接处会出现一条明暗断线。

**半径的选取边界（实测）**：不能取 16px —— 背后 hero 大标题
「你好，我是咸鱼大法。」的**字形仍可辨认**，金色那三个字会显成
一团黄斑浮在菜单上，非常抢眼。24px 把它压成柔和光晕，读不出字、
亮度层次还在。

**降级档位必须两边一一对应**：写了 `html[data-glass="lite"] .glass-nav`
就必须配一条 `html[data-glass="lite"] .mobile-menu__panel`，
否则菜单会比导航栏"能跑更多效果"，在低端机上尤其明显。

### 12.31 【排查陷阱】"亮斑"先确认是滤镜、还是**就是背后的内容**

菜单修完后出现黄白色斑块，第一反应是"折射或 sheen 出问题了"。
分离实验（逐个关掉 refractive / scrim / sheen / 整个 backdrop-filter）后
发现：**关掉全部滤镜、`backdrop-filter: none` 时斑块最清楚** ——
它根本就是背后那条 hero 大标题，隔着半透明玻璃看到的样子。

**教训**：玻璃面板上的任何"异样图案"，先做一次
「把 `backdrop-filter` 设为 `none`」的对照截图。
- 关掉后图案**更清楚/更规整** → 它就是背景内容，属于半透明的固有现象，
  解法是**提高模糊半径**或**提高底色浓度**，不是去修滤镜；
- 关掉后图案**消失** → 才是滤镜/混合模式的问题。

省掉这一步，很容易在滤镜参数上反复空转（本项目已多次在"看清楚"这一步吃亏）。

### 12.32 【铁律】坐标必须在**采集的那一刻**锚定，禁止在 rAF 里做"滚动补偿"

滑动时高光"闪烁"的**真正根因**，经五轮取证才钉死。结论先写：

> **归一化坐标（`--mx/--my`）必须在事件处理器里、与 `clientX/clientY` 同刻
> 由 `rect` 换算出来；`requestAnimationFrame` 只负责缓动与写 CSS。**

#### 病灶：rect 与坐标跨帧混用

`tick()` 原本用「最新一次 `touchmove` 的 `clientY`」配「只在 `rectsDirty` 时
重测的 `rect`」。两者来源不同帧 → 误差 = `Δscroll / 元素高`。
实测 Δscroll=14px、卡片高 298.25px → **4.7%（≈14px）**，
表现为 `--my` 在 `96.48% ↔ 91.79%` 之间反复横跳（约 19 次/秒）＝ 肉眼"光在闪"。

帧内顺序是 `[合成器应用滚动] → [派发 scroll/rAF] → [派发 input 事件]`，
所以 rAF 常常跑在「滚动已应用、新坐标还没到」的窗口里。

#### 为什么"完全跟手"才暴露

`EASE=0.12` 时每帧只吃 12% 的差，4.7% 的阶跃被摊成 0.56%/帧，看不见；
`EASE_TOUCH=1` 后误差被**原样搬上屏幕**。
**这是既有 bug 被放大暴露，不是新引入的** —— 遇到"改了 A 却坏在 B"，
先怀疑 B 本来就是坏的。

#### 错误修法：在 rAF 里补一个 `scrollDy`

`py = clientY - (scrollY_now - coordScrollY)` 能把反向跳变从 19 次/秒降到 0，
但残留偶发跳变。**因为 `window.scrollY` 在事件处理器里读到的是新是旧，
本身就不确定**：实测 delta=0 出现 8 次、delta=14 出现 16 次。
任何"时间差补偿"必然约 1/3 次数补错。**这条路是死的。**

#### 正解：采集时即锚定（`snapCoords()`）

```ts
function snapCoords() {
  for (const s of surfaces) {
    s.rect = s.el.getBoundingClientRect();   // 与 clientX/Y 同刻
    s.tx = (clientX - s.rect.left) / (s.rect.width  || 1);
    s.ty = (clientY - s.rect.top)  / (s.rect.height || 1);
  }
  rectsDirty = false;
}
```

- 三个采集点（`pointermove` / `touchmove` / `pointerdown`）都调它；
- `scroll` 处理器**只**置 `rectsDirty`（供 `inView` 判定），**绝不动坐标**；
- `tick()` 直接用 `s.tx/s.ty`，**不再重测 rect**（重测会把 rect 拉到新滚动
  位置，反而与已锚定的坐标脱钩）。

#### 判定也必须用归一化坐标

`lit` / `pane` 判定原本拿屏幕坐标 `px/py` 比 `r.left/r.top` ——
那是把「差一个滚动量」的错误在判定上**重演一遍**（表现为滚过卡片边缘时
"光进来了又突然灭掉"）。改用 `s.tx/s.ty` 比较，像素容差按元素尺寸换算：

```ts
const ex = LIT_EDGE_PX / (r.width || 1);
const ey = LIT_EDGE_PX / (r.height || 1);
const litNow = s.tx >= -ex && s.tx <= 1 + ex && s.ty >= -ey && s.ty <= 1 + ey;
```

这样四个方向的**物理**容忍度仍一致（12.14 的量纲原则不破）。

#### 验证（`snapverify.mjs`，**最硬的判据**）

前两个脚本都在 rAF 里读 `--my`，而 rAF 跑在 `touchmove` **之前**
（`evorder.mjs` 已证），所以 rAF 读到的天然可能是**上一条** touchmove 写的值
—— 这会制造一个恒为 4.70%（一步长）或 9.38%（两步）的**假滞后**，
与真 bug 无法区分。**别被这个 4.70% 骗到**。

真正绕开时序的判据是**集合包含**：

1. 在 touchmove 处理器里同刻记 `(clientY, rect.top, h)` → **采集刻真值集合**；
2. 收 rAF 里 `--my` 的全部取值 → **实际值集合**；
3. 判据：**实际值集合 ⊆ 真值集合**（且个数 ≤）。

实测（3 次运行一致）：
```
采集刻真值 27 条   真值取值集合 {87.43, 91.79}
--my    取值集合 {87.43, 91.79}      ← 逐值命中，无一个凭空值
① 是否全部落在真值台阶上：✅
③ --my 稳定段 113 帧：反向跳变 0 次，最大反向落差 0.00%
```

**含义**：光**只停在真实采集点**上，一个多余的中间值都没有 ——
这正是「采集时即锚定」的定义。若仍有跨帧混用，必然出现真值集合里
不存在的"空中值"（如 96.81% ↔ 87.09% 之间的任何数）。

`lightfilm.mjs` 截图旁证：24 帧内光斑**恒定停在卡片顶边下方 84.8px**
（卡片本身移动 225px），零位移零反转。

#### 顺带三条

1. **滚动时 `--my` 不应变**：手指在文档坐标里没动，光就该**跟着内容走**。
   若你看到"光在屏幕上原地不动"，那才是 bug。
2. **"最大单帧跳幅"不是抖动指标**：手指按住拖动时，手指**相对卡片确实在
   移动**（每步 ≈4.7%），光跟随它是正确行为。抖动要看**反向跳变** ——
   匀速拖动时 `--my` 应单调，反向为 0。
3. **不要用 CDP 注入去测"连续性"**：注入的坐标序列会被浏览器**合并/丢包**
   （实测发送 29 个、只派发 25~27 个），出现"手指跳 28px 而页面只滚 14px"。
   这是**采集伪影**，真实手指是连续采样，不存在这种事。
   判据：`dropcheck.mjs` —— CDP 序列干净时 Δscroll 与 Δtouch **严格 1:1**。
4. **不在 rAF 里读 `--my` 来判断"有没有滞后"**：rAF 跑在 touchmove 之前，
   读到的可能是上一条事件写的值 → 恒为 4.70% / 9.38% 的**假滞后**。
   要判断正确性，用 **`snapverify.mjs` 的集合包含判据**
   （实际 `--my` 取值集合 ⊆ 采集刻真值集合）。

### 12.33 【排查陷阱】固定采样区会切到"会随滚动收起的浏览器地址栏"（第 5 次）

分析用户录屏时，写死的 Y 采样区（y=1067–1086）反复报出 std≈100 的
"强闪烁"。用 `autocrop.mjs` 逐帧求视口内容底边才发现：底边在
**1009~1153 之间游走** —— 那是 Chrome 移动端**自动隐藏地址栏**在下滑时
收起 / 上滑时展开，正好扫过采样区。页面本身亮度只有 25，地址栏是 250。

**这是本项目测量陷阱的第 5 次**（历次：①从元素中心往外量；②采样点用
"截图高度百分比"；③跨元素比对用了不同列；④采样区混入浏览器 UI；
⑤**固定采样区撞上会动的浏览器 UI**）。

**规则**：分析录屏/截图时，
- 采样区的上下边界必须**逐帧自适应**（找内容底边），不能写死；
- 凡"采样区"与"浏览器 UI"可能重叠，先跑一遍底边漂移检测；
- 移动端浏览器 UI 会**主动随滚动进出**，它不是背景的一部分。

### 12.34 【排查陷阱】"反推 EASE"只取首两帧会系统性偏高

`easetest.mjs` 用有效段**头两帧**反推缓动系数：`1 - r1/r0`。
但头两帧的 `r0` 已经吃过一次缓动 → 反推值**系统性偏高**
（实测 `EASE=0.12` 反推成 **0.226**，曾据此误判"桌面端被改了"）。

**规则**：验证缓动**没变**，看两个不受该偏差影响的量：
- **到 90% 用的帧数**（`EASE=0.12` 的理论值 `0.88^n ≤ 0.1` → n ≈ 18）；
- **逐帧比例是否恒定**（一阶线性缓动的 r 每帧乘同一系数）。

反推数值本身只作参考，不可作为"参数被改"的证据。

### 12.35 【铁律】"指针离开"的哨兵坐标不能贴近任何元素；滞后判定必须排除视口外

用户截图报障：**桌面端鼠标停在页面中部，导航栏却一直亮着。**

#### 病灶：用 `(-1,-1)` 当"已离开"的哨兵

`leaveViewport()` 曾把指针坐标置为 `(-1,-1)` 来表示"离开文档"。
但对**贴着屏幕左上角**的元素（导航栏 `top=0, left=0`），归一化后：

```
s.tx = (-1 - 0) / 1280 = -0.08%
s.ty = (-1 - 0) /   65 = -1.54%
```

而熄灭滞后容差 `rx = (2+6)/1280 = 0.62%`、`ry = (2+6)/65 = 12.3%`：

```
-0.08% >= -0.62%  ✅      -1.54% >= -12.3%  ✅
→ stillNear = true  →  判定仍算"在里面"  →  --lite 永远 1，高光卡死
```

**本质**：`(-1,-1)` 只是"左上角外 1px"，它**暗含了方向假设** ——
对任何贴近左上角的元素都仍算"附近"。

**注意这是滞后（hysteresis）引入的副作用**：12.32 那一轮为压掉边界抖动
加了 `LIT_RELEASE_PX = 6` 的死区，结果这个死区把"离开视口"也一起吞了。
**加滞后时一定要问："它会不会把某个'应当立刻失效'的状态也留住？"**

#### 两处一起修（缺一不可）

1. **哨兵改远**：`clientX = clientY = -9999`。
   归一化后变成绝对值远超容差的大负数（`--my` 实测 −15380%），
   任何元素都不可能包含它。
2. **滞后判定加前置条件**：
   ```ts
   const stillNear =
     pointerInViewport &&      // ← 指针不在视口里，滞后逻辑不适用
     s.tx >= -rx && s.tx <= 1 + rx && s.ty >= -ry && s.ty <= 1 + ry;
   ```
   滞后是为了**压抖动**，不是为了**让已经离开的手指保持点亮**。

#### 验证（`litstuck.mjs` + `navbleed.mjs`）

`litstuck.mjs` 四个场景：
```
悬停导航栏(y=30)     --lite=1  ::after.op=1   ✅
页面中部(y=400)      --lite=0  ::after.op=0   ✅
派发 mouseleave      --lite=0  ::after.op=0   ✅（修前是 1，卡死）
视口底部(y=790)      --lite=0  ::after.op=0   ✅
```

`navbleed.mjs` 用**截图采样导航栏像素亮度**（不只看变量）：
```
指针远在底部      亮度(中) = 48.7   基准
指针在截图位置    亮度(中) = 48.7   差值 0.00  ✅ 无隔空点亮
指针悬停导航栏    亮度(中) = 76.6   差值 27.90 ✅ 正常点亮
```

**教训**：断言"亮不亮"要**截图像素**为准，不能只看 `--lite`
—— `--lite` 是**开关**，而人眼看到的是 `::after` 的 `opacity × 620px 渐变`
与其余材质叠加后的结果。两者在过渡期间（500ms）可以不一致。

### 12.36 【铁律】"还未收到真实指针"必须表达为**指针不在任何地方**，不能用一个"好看的默认光位"

用户报障（桌面端）：

> 「当我按导航栏上的按钮切换页面后，新页面的卡片全部都是退让状态，
>   鼠标动一下才恢复正常。比如：我在主页点了一下导航栏上的"陈叔叔的软件"
>   切换到 /apps，点击完之后光标不动，/apps 页面上的所有卡片就都是退让状态；
>   按主页上的"看看我做的软件"按钮也有同样的情况，**只要是切换页面就会这样**。」

#### 报障描述会把人带偏：真凶不在"切换页面"

这句话读起来像是"页面切换时状态残留"，于是第一反应是在
`astro:page-load` / `collect()` 里补一句清理。**这个方向是错的**
（虽然最后确实也补了，但只是锦上添花）。

`focuspairs.mjs` 一测就露馅 —— 注意**第一行**：

```
=== 场景 1：主页 → 点导航栏「陈叔叔的软件」→ /apps ===
  主页稳定后              path=/     focus=inside  pane=3 缩小=3   ← 🚨
  悬停导航栏链接(未点击)     path=/     focus=null    pane=3 缩小=0
  点导航栏后(鼠标不动)      path=/apps  focus=inside  pane=2 缩小=2
  轻移鼠标后             path=/apps  focus=null    pane=2 缩小=0
```

**页面刚加载完、还没做过任何鼠标操作，`data-focus` 就已经是 `inside`、
三张卡全缩着。** 所以这个错误与"切换页面"**无关** ——
它每次脚本初始化都犯一次，切页只是**再犯一次**而已。
（用户之所以只在切页时注意到，是因为初次加载时入场动画刚好盖住了那一瞬。）

#### 根因：默认光位被当成**真实判定输入**

```ts
// 顶层：一个特意挑的"右上角主光斑方向"的默认光位
let clientX = window.innerWidth  * 0.78;
let clientY = window.innerHeight * 0.08;

// collect()：每个 surface 的默认光位 —— 同一个点
tx: 0.78,  ty: 0.08,
```

这个默认值本身**动机是好的**（"还没移动指针时页面也好看"），
但它踩了致命的一脚：**它是真实的判定输入**。

首次 `wake()` 那一帧，`snapCoords()` 还没跑过，`s.tx/s.ty` 就是
`0.78 / 0.08` —— 而它**落在任何一张卡片的宽度 78%、高度 8% 处**。
卡片高约 300px → `8% = 卡顶下方 24px`，**确确实实在卡内**。
于是 `insideNow = true` → `anyInside = true`
→ 写入 `html[data-focus="inside"]` → **全站卡片后退**。

切页时 Astro 的 `astro:page-load` 重新 `collect()`，
surfaces 被重建、默认坐标再次进场 → **同样的假坐标再判一次 inside**。

#### 正解

初值改用**没有方向假设**的离开哨兵（与 12.35 的 `leaveViewport` 共用）：

```ts
// 模块作用域（被两处共用，语义相同："指针不在任何地方"）
const OFFSCREEN = -9999;

let clientX = OFFSCREEN;
let clientY = OFFSCREEN;
```

视觉上**零损失**：`--mx/--my` 仍由 `collect()` 的默认光位提供
（它们只决定"还没动指针时高光画在哪"）；变的只是**判定输入**。

另加一道保险：`collect()` 末尾主动 `clearFocus()` ——
重建 surfaces 时同时撤销 `focusInside` 变量与 `data-focus` 属性，
保证"重新收集"后状态从干净地板开始。
（注意 `clearFocus` 必须从 `const` 箭头函数改成**函数声明**：
`collect()` 在模块底部就会执行一次，而 `const` 有 TDZ，
那一刻它还没求值 → 会抛 `Cannot access 'clearFocus' before initialization`。）

#### 验证

```
focuspairs.mjs（修后）：全部 focus=null 缩小=0
  主页稳定后 / 悬停链接 / 点导航栏后 / 轻移鼠标后        ✅
  点 hero 按钮后                                       ✅
  （最后一行"轻移鼠标后 focus=inside 缩小=1" 是**正确行为**：
    指针真的落在某张卡上 → 那张卡 hover 抬起、其余 1 张后退）

navfocus.mjs（修后）：S1 null/0    S2 null/0    S3 null/0     ✅

回归：repro.mjs 8/8 ✅ · easetest.mjs 移动 1 帧 / 桌面 18 帧（缓动未变）✅
      snapverify.mjs 反向跳变 0 次 ✅ · litstuck.mjs 四场景 ✅ · 构建 9 页 ✅
```

**教训**：
1. **报障里"只要 X 就会 Y"的描述，不要默认 X 是原因** ——
   先量"最平静的状态"（刚加载完、什么都没做），往往一测就破。
2. **任何"给用户看的默认值"都禁止复用为判定输入**。
   要"还没动指针时好看"，就让**输出**（`--mx/--my`）好看；
   判定输入必须诚实表示"我还不知道指针在哪"。
3. `collect()` 这类"重建全部状态"的函数，**必须同时撤销对应的全局开关**，
   否则模块级变量与 DOM 属性会脱钩。

### 12.37 【铁律】"没写"与"写成默认值"是两件不同的事；默认值必须取**安全的失败方向**

用户紧接着上一轮报障（12.36 修完之后）：

> 「现在切换页面或者刷新页面，鼠标不动，光直接默认打在卡片右上方，导航栏也是」

截图证据：右上方有明显白斑；而我 12.36 的修复只保证了"卡片不再退让"，
**光却还亮着**。

#### 第一层：我上一轮**修错了变量**

12.36 把 `clientX/clientY` 的初值改成 `OFFSCREEN`，据此认为"指针未知就
不会被判定为在元素内"。复查发现判定其实读的是**另一组变量**：

| | 我改的 | 真正的判定输入 |
|---|---|---|
| 变量 | `clientX/clientY` | **`s.tx / s.ty`**（每元素锚定坐标） |
| 用途 | 只喂给 `pointerInViewport` | `litNow` / `paneNow` **全靠它** |

`s.tx/ty` 只由 `snapCoords()` 写，而 `snapCoords()` **只在 pointer/touch
事件里被调用**。在第一个真实指针事件到来之前，它们一直是 `collect()` 给的
`0.78 / 0.08` —— 恰好落在卡片内部（宽 78%、高 8%）→ `litNow = true`
→ `litOn = true` → `--lite = 1`。

**证据**（`txprobe.mjs` 逐帧 style 变化）：
```
   #   t(ms) 元素                          --mx      --my      --lite
   0    253  glass-nav liquid-surface      78.00%     8.00%      1   ← 🚨
   5    253  isolate bg-white/10 border    78.00%     8.00%      1
   8    253  block isolate bg-white/8 b    78.00%     8.00%      1
```
`litewhy.mjs` 用劫持 `setProperty` 拿调用栈，证明 8 次写 `1` 全来自
`tick()` 里 `--lite` 那一行。

**修法**：把"坐标是否来自真实指针"变成**显式状态**，而不是靠
"坐标恰好看起来合理"去猜：
```ts
let coordsLive = false;          // 全局：收到过至少一次真实指针事件
// 每个 surface：
snapSeen: false,                 // 该元素自己的 tx/ty 被 snapCoords() 写过
litWritten: false,               // 是否已显式写过 --lite（哪怕写 0）
```
`litNow` / `paneNow` / `stillNear` 全部加 `s.snapSeen` 前置 ——
没被真实指针写过就**一律判为"指针不在其中"**。

#### 第二层：`litValue !== s.lit` 导致**该写的不写**

改完上面，`--lite` **一次都没写**（`txprobe`：0 次写入）—— 因为
`s.lit` 初值 false、`litValue` 也是 false，**相等 → 跳过**。
"跳过"意味着该元素的 `--lite` 退回 **CSS 默认值**，而 CSS 当时写的是
```css
.liquid-surface { --lite: 1; }   /* 动机：未启用 JS 时也亮着，不难看 */
```
→ **JS 以为"灭"，页面显示"亮"，语义正好相反**。
`litezero.mjs`：`inline=(空) computed=1 ::after.opacity=1` —— 光还亮着。

这是本轮最隐蔽的一点：**"没写"不等于"写成 0"**。
只在"值变化时写"的优化，遇到"初始值恰好等于目标值"时，
就把控制权悄然让给了 CSS 默认值。

**修法**：加 `litWritten`，每个元素被登记后**第一帧必定写一次**（哪怕写 0）：

```ts
if (!s.litWritten || litValue !== s.lit) {
  s.lit = litValue; s.litWritten = true;
  style.setProperty("--lite", litValue ? "1" : "0");
}
```

#### 第三层：CSS 默认值必须取**安全的失败方向**

`--lite` 的默认值同时兼着两个**互相冲突**的角色：
① "首帧外观" ② "JS 未启用时的兜底"。

- 若默认 `1`：JS 一旦没跑到 / 报错 / 被禁用，**全站白光**挂在卡片右上角。
  这不是"降级得体面"，这是用户可见的 bug（就是本轮报障本身）。
- 若默认 `0`：最坏情况是"这次没点亮"，**没有任何人会看到异常**。

而且"没 JS 时亮一点"本来就没价值 —— 那点静态高光不构成视觉亮点，
却把**状态默认值**污染成了"看着好看"的值。高光的**位置**
（`--mx/--my`）保留好看的默认值就够了，画面依旧有设计感，只是不发光。

```css
.liquid-surface { --mx: 78%; --my: 8%; --lite: 0; }  /* 默认灭 */
```

**A/B 实证**（`nojs.mjs`，用 `Emulation.setScriptExecutionDisabled` 禁 JS）：
```
旧 CSS：卡片 computed --lite = 1  ::after.opacity = 1   🚨 无 JS 时发光
新 CSS：卡片 computed --lite = 0  ::after.opacity = 0   ✅ 无 JS 时不发光
```

#### 验证

```
followup.mjs （新增，12 项）全部通过：
  ① 未进入：--lite=0、--mx/--my=默认光位(78%/8%)、focus=null   ✅
  ② 卡片正中：--lite=1、--mx≈50%                              ✅
  ③ 卡片左下：--mx≈22%、--my≈70%（跟随准确）                   ✅
  ④ 卡片间隙(32px)中点：--lite=0、focus=null                   ✅
  ⑤ 页面空白：--lite=0                                        ✅
  ⑥ mouseleave：--lite=0                                      ✅

glowdiff.mjs（逐像素差分，不靠肉眼也不靠变量）：
  ① 两次独立加载（含一次 reload）整页 平均差 0.000、变化像素 0.00%
     → **完全确定**，无残留亮斑
  ③ 顶部 0~120px（导航栏区）平均差 0.000、变化像素 0.00%
     → 非卡片区域零波及

回归：repro.mjs 8/8 ✅ · focuspairs.mjs 全 null·0 ✅
      easetest.mjs 移动 1 帧 / 桌面 18 帧 ✅ · snapverify.mjs 反向跳变 0 次 ✅
      构建 9 页 ✅
```

**三条通用教训**：
1. **判定输入与"好看的值"必须物理隔离**。同一个数既当输出又当输入时，
   任何"为了好看"的调整都会悄悄改变行为。12.36 修了全局坐标，
   这一轮才知道**元素坐标是另一组输入** —— 改一个 bug 时要把
   "这条判定读了哪些变量"**逐个列出来**，不能凭直觉只改最显眼的那个。
2. **"没写"≠"写成 0"**。`if (new !== old) write()` 这类优化在
   "初始值正好等于目标值"时会静默不写，把控制权交给 CSS 默认值。
   凡是**状态型**自定义属性，都要有一个 `xxWritten` 标志保证首帧必写。
3. **默认值要选安全的失败方向**。问自己："如果 JS 没跑，用户会看到什么？"
   答"一片诡异的白光"说明默认值选错了。宁可"什么都没发生"，
   也不要"看起来像坏了"。

## 附：修复记录（续）

### 12.38 【铁律】焦点环：白色 · 画在元素外侧 · 用 outline 不用 box-shadow · 落全局

**背景**（2026-10-03）：审计发现全站交互元素的键盘焦点态**没有任何自定义样式**，
完全依赖浏览器默认 `outline: auto`。其后果是：
- 颜色/粗细/圆角**随浏览器与系统主题漂移**（Edge 深色下白、Chrome 深色下近黑）；
- `outline` 不跟随 `border-radius`，圆角卡片上的方框环很丑；
- 与本站玻璃语言完全无关。

**为什么原规范写金色、现在改成白色**：
金色光晕（`rgba(228,184,99,0.15)`）在深色底上过于抢眼，键盘连续 Tab 时会
一路闪金光，用户明确要求「朴实一点」。白色低透明度环更接近系统 UI 的
朴实焦点语言。**香槟金从此不用于焦点环**，仅保留在 §2 规定的主 CTA /
关键数字 / 高亮文字。

**为什么环要画在元素「外侧」**（第三轮修订，用户要求对齐 Edge 观感）：
第一版用 `box-shadow: 0 0 0 1px` 画环 —— 它从元素**外边界**生长，
与卡片的 `border border-white/15` 糊成一条线，读起来像"卡片自己变亮了"，
没有"外框套住"的层次。用户给 Edge 截图对照，要求「跟 edge 一样在卡片外侧」。

**实现五要点**（缺一不可，第 1、2 条是硬坑）：
1. **用 `outline` + `outline-offset: 4px` 画环，不要用 box-shadow**。
   `outline-offset` 向外留出暗缝 → 形成"元素 → 缝隙 → 白环"的分明结构。
   现代 Chromium / Firefox 的 outline 会跟随 `border-radius`，圆角不失真。
2. **绝对不要写 `border-radius: inherit`**：那会用**父元素**的圆角覆盖元素自身
   的 `rounded-3xl` —— 实测 `borderRadius: 0px`，卡片瞬间变直角、环也变方。
   焦点样式**不需要**碰 `border-radius`，元素自己的圆角就够。
3. **`outline` 与 `box-shadow` 互不覆盖**（这是改用 outline 的附带红利）：
   不必再把元素原外阴影整串抄一遍；聚焦时 `0 16px 40px` 结构不变，
   **天然满足铁律 2**。外圈柔光（`0 0 0 5px rgba(255,255,255,.12)`）是纯附加光晕，
   不承载原有阴影，所以绝不会"掉阴影"。
4. **落全局 `:focus-visible`，不要落 `glass.ts` 常量**。「逐个套用」必然漏
   （§12.1.1 已有同款教训）；全局规则让新增交互元素自动获得。
5. 只作用于 `:focus-visible`（鼠标点击不亮环），且 `sr-only` 控件要单独摘掉
   白环、把环画在它的可见载体上（如开关的轨道）。

**验证**（`focusring2.mjs`，逐像素扫边界，从外向内）：
- 卡片：`x-6/-5 lum≈220`（白环 2px）→ `x-4~-1 lum≈48`（暗缝 4px）
  → `x+0 lum=70`（卡片边框）—— 「暗缝 + 白环」结构分明 ✅
- computed：`border-radius: 24px`（未被 inherit 破坏）· `outline: 2px solid
  rgba(255,255,255,.85)` · `outline-offset: 4px` ✅
- 开关（真实 Tab 路径）：`input` outline/shadow 皆 none（隐藏盒不漏）
  · `track` 白环在胶囊外侧 + 滑块保持"开"状态的纯白高光 ✅
- `followup.mjs` 12/12 ✅ · 构建 9 页 ✅


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

所有非输入框的可交互元素（按钮、链接、chips）键盘焦点态统一为：

```
focus-visible:outline-none
focus-visible:shadow-[0_0_0_3px_rgba(228,184,99,0.15),0_8px_24px_rgba(3,7,18,0.45)]
```

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

## 附：修复记录（续）

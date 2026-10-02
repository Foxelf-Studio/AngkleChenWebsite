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
| **L3 液态跟手** | JS → CSS 变量 | 卡片 / 按钮 | 指针位置经 lerp 缓动写入元素级 `--mx/--my`，驱动一枚 `screen` 混合的高光斑 |
| **L2 折射** | SVG `feDisplacementMap` | **暂未启用** | 见 12.4 |

**L1 与"背景模糊"彻底解耦**是本层最重要的架构决定。历史上所有「相邻元素亮带」bug 的根源，都是让同一个 `backdrop-filter` 同时承担"光学材质"与"背景模糊"两件事。

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

### 12.4 方案 B（SVG 折射）的适用边界

`feDisplacementMap` 位移的是**元素自身的渲染结果（含文字）**，不是元素背后的页面。由此推出两条硬约束：

1. **绝不加在承载文字 / UI 的容器上**——字形会被推糊，且滤镜的额外离屏重采样会让整块发灰。（2026-10-01 导航栏实测踩坑）
2. **只有当元素同时带 `backdrop-filter`**（即"自身渲染结果里含被模糊的背景"）时，位移才有物理意义。无 blur 的元素用它 = 自己歪一下、背景纹丝不动，纯属空转。

**结论**：导航栏上找不到能成立的落点，故本站导航栏**不做折射**——玻璃厚度改由「上亮下暗双向边框 + inset 顶高光 + 外层深阴影」表达（即 3.1 的「光有方向」）。
滤镜定义保留在 `src/components/LiquidFilter.astro`，留给真正有大面积内容可折射的场景。

### 12.5 降级分级（Graceful Degradation）

由 `src/scripts/liquid.ts` 特性检测后写入 `<html data-glass="…">`。**不靠 UA 嗅探**（不可靠且易误判）。

| 档位 | 触发条件 | 行为 |
| --- | --- | --- |
| `full` | 默认（支持 backdrop + SVG filter，无省流/低内存） | 全开 |
| `lite` | `saveData` 或 `deviceMemory ≤ 4` | 模糊减半（导航 40→16px、遮罩 20→10px），高光强度 0.7 |
| `static` | `prefers-reduced-motion: reduce` | **保留材质、只关动效**。`reduce` 管的是"动"，不是"美" |
| `fallback` | 不支持 `backdrop-filter` 或 SVG filter | 摘掉模糊，退化为半透明白底 + 边框；固定光位 |

**调试开关**：URL 加 `?glass=full|lite|static|fallback` 可强制档位，用于逐档验收。生产环境不带参数时完全不生效。

> ⚠️ **实现注意**：Tailwind v4 的工具类位于 `@layer utilities`，**层叠优先级低于普通 CSS 规则**。
> 因此自定义 CSS 里**不要设置 `position`/`display` 这类会被工具类管理的属性**——会静默覆盖掉 `.fixed`/`.absolute`。
> 需要给这类属性兜底时，用 `:where()` 把特异性压到 0（如 `:where(.liquid-sheen) { position: relative }`）。
> 2026-10-01 导航栏 `fixed` 失效、跟着页面滚走，就是这个坑。

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

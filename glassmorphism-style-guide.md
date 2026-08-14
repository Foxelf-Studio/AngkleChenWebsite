# Glassmorphism（玻璃拟态）设计规范 · 修订版 v1.1

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

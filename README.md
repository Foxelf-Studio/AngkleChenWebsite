# ✨ 陈叔叔的奇幻空间

个人博客网站，玻璃拟态（Glassmorphism）风格，基于 **Astro + TinaCMS** 构建，支持可视化编辑内容。

## 技术栈

- **Astro 6** — 静态站点生成
- **TinaCMS 3** — 可视化内容编辑（本地模式，无需云账号）
- **Tailwind CSS 4** — 玻璃拟态样式
- **Markdown** — 文章正文

## 本地开发

```bash
npm install
npm run dev
```

- 站点：http://localhost:4321
- 可视化编辑器：http://localhost:4321/admin/index.html

> 提示：在 `/admin` 里可以点页面上的文字直接编辑，保存即写回 `src/content/` 下的 Markdown 文件。

## 内容结构

```
src/content/
├── posts/      # 文章（title/date/tags/excerpt + Markdown 正文）
├── apps/       # 陈叔叔的软件
└── about/      # 关于页与站点文案
```

## 构建与部署

```bash
npm run build   # 输出到 dist/
```

部署到 Cloudflare Pages：
- 构建命令：`npm run build`
- 输出目录：`dist`

## 目录说明

- `src/pages/` — 页面（文章列表 / 详情 / 标签 / 软件 / 关于）
- `src/layouts/` — 全局布局（导航 + 页脚）
- `src/lib/glass.ts` — 玻璃拟态 class 常量
- `tina/config.ts` — TinaCMS 内容模型
- `glassmorphism-style-guide.md` — 玻璃拟态设计规范（v1.1）

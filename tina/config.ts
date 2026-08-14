import { defineConfig } from "tinacms";

// 部署到 Cloudflare Pages 时用 HEAD 环境变量确定分支
const branch =
  process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  // 留空 = local mode（本地可视化编辑，直接写回文件，无需 Tina Cloud）
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "posts",
        label: "文章",
        path: "src/content/posts",
        format: "md",
        fields: [
          {
            type: "string",
            name: "title",
            label: "标题",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "发布日期",
            required: true,
          },
          {
            type: "string",
            name: "tags",
            label: "标签",
            list: true,
            ui: {
              component: "tags",
            },
          },
          {
            type: "string",
            name: "excerpt",
            label: "摘要",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "正文",
            isBody: true,
          },
        ],
      },
      {
        name: "apps",
        label: "陈叔叔的软件",
        path: "src/content/apps",
        format: "md",
        fields: [
          {
            type: "string",
            name: "name",
            label: "名称",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "icon",
            label: "图标（emoji）",
          },
          {
            type: "string",
            name: "version",
            label: "版本",
          },
          {
            type: "string",
            name: "tag",
            label: "分类",
          },
          {
            type: "string",
            name: "description",
            label: "简介",
            ui: {
              component: "textarea",
            },
          },
        ],
      },
      {
        name: "about",
        label: "关于与站点",
        path: "src/content/about",
        format: "md",
        fields: [
          {
            type: "string",
            name: "siteTitle",
            label: "站点标题",
          },
          {
            type: "string",
            name: "siteSubtitle",
            label: "站点副标题",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "email",
            label: "邮箱",
          },
          {
            type: "string",
            name: "github",
            label: "GitHub",
          },
          {
            type: "rich-text",
            name: "body",
            label: "关于页正文",
            isBody: true,
          },
        ],
      },
    ],
  },
});

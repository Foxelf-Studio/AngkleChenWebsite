// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import tina from "@tinacms/astro/integration";

export default defineConfig({
  integrations: [tina()],
  markdown: {
    // 代码块不做语法高亮着色，保持 Glassmorphism 克制的单色代码风格（由 .md-body 样式控制）
    syntaxHighlight: false,
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: [
        "tinacms",
        "@tinacms/astro",
        "monaco-editor",
        "react",
        "react-dom",
      ],
    },
  },
});

import { defineConfig } from "vite";
import { resolve } from "path";
import { rmSync } from "node:fs";
import vue from "@vitejs/plugin-vue2";
import electron from "vite-plugin-electron/simple";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  // 同步删除给定路径上的文件-->清空dist-vite目录
  rmSync("dist-vite", { recursive: true, force: true });
  // 同步删除给定路径上的文件-->清空dist-electron目录
  rmSync("dist-electron", { recursive: true, force: true });

  const root = process.cwd();
  const isDev = mode === "dev";
  // 插件
  const plugins = [
    vue(),
    electron({
      main: {
        entry: "electron/main.js",
        vite: {
          build: {
            minify: !isDev,
          },
        },
      },
      preload: {
        input: {
          preload: "electron/preload.js",
          spinner: "electron/spinner.js",
        },
        vite: {
          build: {
            minify: !isDev,
            // 多个input文件需要设置为false
            // https://rollupjs.org/configuration-options/#output-inlinedynamicimports
            // 该选项用于内联动态引入，而不是用于创建包含新 chunk 的独立 bundle。
            // 该选项只在单一输入源时发挥作用。请注意，它会影响执行顺序：如果该模块是内联动态引入，那么它将会被立即执行。
            rollupOptions: { output: { inlineDynamicImports: false } },
          },
        },
      },
    }),
    // 为 Node.js 核心模块提供补丁，使其可以在浏览器中使用
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ];

  return defineConfig({
    root,
    plugins,
    resolve: {
      alias: {
        "@": pathResolve("./src"),
      },
      extensions: [".js", ".vue", ".json"],
    },
    build: {
      outDir: "dist-vite",
      assetsDir: "static",
      // 启用/禁用 gzip 压缩大小报告。
      reportCompressedSize: false,
      // 规定触发警告的 chunk 大小。（以 kB 为单位）
      chunkSizeWarningLimit: 2000,
      // 设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
      clearScreen: false,
      //启用/禁用 CSS 代码拆分。当启用时，在异步 chunk 中导入的 CSS 将内联到异步 chunk 本身，并在其被加载时一并获取。
      cssCodeSplit: true,
      //自定义底层的 Rollup 打包配置
      rollupOptions: {
        external: ["electron"],
      },
      // 依赖优化选项
      optimizeDeps: {
        //在预构建中强制排除的依赖项
        // 告诉 Vite 排除预构建 electron，不然会出现 __diranme is not defined
        exclude: ["electron"],
      },
    },
  });
});

function pathResolve(dir) {
  return resolve(process.cwd(), ".", dir);
}

## vite-vue2

## 解决问题：

1. gm-crypto electron 打包后报 Buffer 的错误

## 备忘录

1. package.json 暂时不需要 key：browserslist
   package.json 简化版
   `{"name": "vite-vue2","browserslist": [ "defaults"]}`

- browserslist:在不同的前端工具之间共用目标浏览器和 node 版本的配置工具
- 主要被以下工具使用：
  - Autoprefixer
  - Babel
  - post-preset-env
  - eslint-plugin-compat
  - stylelint-unsupported-browser-features
  - postcss-normalize
- 用途：
  在创建前端工程的时候，一个比较好的做法是制定你的工程上线之后主要支持的浏览器版本，在你支持的浏览器版本里面，你的项目运行没问题，不在范围的浏览器可能会出现一些高级 JS，css 特性不支持的 bug。哪些新的 ES6+的特性保留原样，哪些特性要转译成 es5，webpack，babel 本身是通过这个工具提供的浏览器支持范围来确定的

2. jsconfig.json 文件

- Vetur 插件会读取

3. npm 常用参数

- -P(--save-prod)：dependencies 依赖项安装，不指定-D 或-O 时，默认使用此项
- -D(--save-dev)：devDependence 开发依赖项安装
- -O(--save-optional)：optionalDependencies 可选依赖项安装
- -g(--global)：全局安装
- -B(--save-bundle)： bundleDependencies 依赖项安装
- -E(--save-exact)：明确版本号安装，使用^符号进行默认安装。
- -w(--workspace)： install 命令也是支持多工作区安装的
- -ws(--workspaces)：设置为 false 时，禁用 workspaces

4. package.json key build 增加 "npmRebuild": "false",

# Weekly Report (2025-06-30 to 2025-07-06)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-06-30 to 2025-07-06)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 11
Total files touched: 209
Total lines +/-: +22786 / -16340

## Per-module summary
- ProjectPrinting (.): commits=1, files=1, +317/-0
- admin (admin): commits=4, files=9, +587/-493
- frontend (frontend): commits=6, files=199, +21882/-15847
- backend (backend): commits=0, files=0, +0/-0

## Heat by top-level directory (per module)
- ProjectPrinting:
  - docs: 317
- admin:
  - pnpm-lock.yaml: 1036
  - package.json: 26
  - .vscode: 6
  - README.en_US.md: 4
  - README.md: 4
  - packages: 4
- frontend:
  - pnpm-lock.yaml: 11011
  - src/pages-sub/checkout: 4801
  - src/pages-sub/filePrinting: 4164
  - src/pages/order: 2444
  - src/pages-sub/mine: 1871
  - src/pages/library: 1676
  - src/pages-sub/library: 1217
  - src/components/LoginPopup.vue: 1128
  - src/service/app: 942
  - src/pages/home: 937
  - src/pages-sub/order: 828
  - src/pages/mine: 544
  - src/utils/amap-wx.js: 526
  - .github: 429
  - src/utils/uploadFile.ts: 324

## Commit subjects (up to 10 per module)
- ProjectPrinting:
  - [undefined] feat: 资料库子页面HTML设计稿
- admin:
  - [undefined] chore(packages): update Vite version to 7 in package.json and documentation.
  - [undefined] chore(deps): update deps
  - [undefined] chore(vscode): remove unused vue.server.hybridMode setting from .vscode/settings.json
  - [undefined] fix(projects): Fix i18n-ally not working when setting moduleResolution to bundler. fixed #780
- frontend:
  - [undefined] feat: 更新eslint配置，添加import/order规则；优化多个组件的样式和逻辑
  - [undefined] refactor: 修复了大量eslint报错和一些校验/定义问题
  - [undefined] feat: 删除自动合并和发布日志的工作流文件
  - [undefined] feat: 修复了unibest更新后的一些报错，并优化了资料库和订单的界面
  - [undefined] feat: 更新unibest版本以优化性能与支持最新功能
  - [undefined] feat: 添加图书馆详情页面和文件卡片组件，更新相关路由和类型定义

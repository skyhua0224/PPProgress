# 周报（2025-03-10 至 2025-03-16）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-03-10 至 2025-03-16）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 24
触达文件总数: 147
行变更合计 +/-: +5749 / -3241

## 按模块汇总
- ProjectPrinting (.): commits=1, files=1, +1/-0
- admin (admin): commits=11, files=90, +3114/-1377
- frontend (frontend): commits=4, files=26, +2274/-1719
- backend (backend): commits=8, files=30, +360/-145

## 顶层目录热力（按模块）
- ProjectPrinting:
  - .gitignore: 1
- admin:
  - pnpm-lock.yaml: 1855
  - src/views/app-manage: 1804
  - src/typings/app.d.ts: 257
  - src/locales/langs: 140
  - src/service/api: 126
  - src/router/elegant: 66
  - CHANGELOG.md: 34
  - packages: 32
  - src/store/modules: 32
  - build: 29
  - package.json: 24
  - src/layouts/modules: 18
  - src/views/_builtin: 14
  - src/typings/elegant-router.d.ts: 9
  - src/plugins/loading.ts: 6
- frontend:
  - src/pages-sub/checkout: 2714
  - pnpm-lock.yaml: 492
  - src/service/orderService.ts: 242
  - src/service/delivery.ts: 185
  - src/service/deliveryConfigService.ts: 143
  - src/pages/order: 133
  - src/pages-sub/order: 46
  - package.json: 38
- backend:
  - src/main/java: 505

## 提交主题（每模块最多 10 条）
- ProjectPrinting:
  - [undefined] chore: 添加 .spring-api-helper.json 到 .gitignore
- admin:
  - [undefined] refactor: 优化楼宇管理页面
  - [undefined] docs(projects): update README (#718)
  - [undefined] chore(deps): update deps
  - [undefined] chore(projects): update vscode settings and launch
  - [undefined] fix: 修复楼宇管理新增时替换原楼宇的问题
  - [undefined] feat: 添加配送管理相关接口和组件，优化配送配置搜索功能
  - [undefined] chore(projects): release v1.3.12
  - [undefined] feat(projects): support proxy log in terminal
  - [undefined] chore(deps): update deps
  - [undefined] feat(projects): feat(projects): TableColumnCheck title support VNode (#716)
- frontend:
  - [undefined] feat: 完成对送货卡片的设计
  - [undefined] feat: 完成对校园场景楼宇选择的设计
  - [undefined] fix: 解决宿舍楼等数字范围楼的选择器渲染问题
  - [undefined] feat: 添加预约时间选择和配送地址构建逻辑，优化取货方式显示
- backend:
  - [undefined] feat: 增加根据配送类型和楼宇类型查询楼宇的方法
  - [undefined] feat: 增加按店铺ID和类型获取所有配送配置的方法
  - [undefined] fix: 修复店铺创建请求中缺少提取取货方式和取货方法的字段
  - [undefined] fix: 修复了没有获取所有楼宇及根据店铺ID获取楼宇的方法
  - [undefined] feat: 新增楼宇相关接口，支持获取所有楼宇及按条件查询
  - [undefined] feat: 增加获取所有配送配置的方法，支持不传店铺ID时获取所有配置
  - [undefined] fix: 修正订单服务中配送类型的设置，使用代码而非值
  - [undefined] feat: 新增配送配置和楼宇信息相关功能，包含DTO和枚举类型

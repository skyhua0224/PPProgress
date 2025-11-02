# 周报（2024-10-07 至 2024-10-13）

## 开发进展

# 开发进展 — 主仓与子模块（自 2024-10-07 至 2024-10-13）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 18
触达文件总数: 1700
行变更合计 +/-: +192079 / -191171

## 按模块汇总
- ProjectPrinting (.): commits=12, files=1150, +30980/-189956
- admin (admin): commits=2, files=12, +1152/-930
- frontend (frontend): commits=3, files=523, +159215/-285
- backend (backend): commits=1, files=15, +732/-0

## 顶层目录热力（按模块）
- ProjectPrinting:
  - frontend/src/static: 138193
  - admin/pnpm-lock.yaml: 17056
  - frontend/pnpm-lock.yaml: 12471
  - admin/CHANGELOG.md: 5372
  - admin/packages/color: 5110
  - admin/src/layouts: 4456
  - admin/src/store: 4174
  - frontend/src/pages-sub: 3220
  - admin/src/typings: 2938
  - admin/packages/materials: 2258
  - admin/src/views: 2076
  - frontend/src/pages: 1653
  - admin/src/hooks: 1650
  - admin/src/components: 1562
  - admin/packages/hooks: 1328
- admin:
  - pnpm-lock.yaml: 1867
  - packages: 179
  - package.json: 36
- frontend:
  - src/static/pdf: 138160
  - pnpm-lock.yaml: 13352
  - src/pages-sub/filePrinting: 1474
  - src/pages-sub/checkout: 892
  - src/pages-sub/mine: 607
  - src/pages/home: 514
  - src/pages-sub/picPrinting: 392
  - src/pages/order: 308
  - src/pages/library: 302
  - src/types/auto-import.d.ts: 262
  - src/pages/mine: 251
  - src/utils/index.ts: 178
  - package.json: 170
  - vite.config.ts: 157
  - manifest.config.ts: 134
- backend:
  - mvnw: 259
  - mvnw.cmd: 149
  - src/main/java: 145
  - pom.xml: 57
  - src/test/java: 34
  - .gitignore: 33
  - sql: 29
  - .mvn: 19
  - src/main/resources: 7

## 提交主题（每模块最多 10 条）
- ProjectPrinting:
  - [undefined] chore: 更新子模块到最新提交并添加VSCode配置
  - [undefined] chore: 更新frontend子模块到最新提交并添加VSCode设置
  - [undefined] feat: 添加子模块配置，包含admin、frontend、backend和uml
  - [undefined] chore: 储存库分离
  - [undefined] feat: 更新docker-compose配置，修改MySQL环境变量并添加新的配置文件
  - [undefined] feat: 更新docker-compose配置，添加MySQL健康检查和外部网络支持
  - [undefined] feat: 添加多个新文件和配置，增强项目结构和功能
  - [undefined] feat: shabichiwodaima
  - [undefined] fix: 修改了UML的一些错误
  - [undefined] feat: 修改了puml
- admin:
  - [undefined] chore(deps): update deps
  - [undefined] feat(packages): add subpackage `@sa/alova` (#640)
- frontend:
  - [undefined] feat: 更新了登录界面以及修正了支付界面的金额数值
  - [undefined] feat: 更新依赖项，添加新库以增强功能
  - [undefined] feat: 初始化项目结构，添加配置文件和必要的目录
- backend:
  - [undefined] feat: 初始化项目结构，添加数据库配置和用户实体

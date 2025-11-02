# 周报（2025-04-07 至 2025-04-13）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-04-07 至 2025-04-13）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 9
触达文件总数: 118
行变更合计 +/-: +12043 / -3254

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=6, files=80, +10084/-3149
- frontend (frontend): commits=0, files=0, +0/-0
- backend (backend): commits=3, files=38, +1959/-105

## 顶层目录热力（按模块）
- admin:
  - pnpm-lock.yaml: 6799
  - src/views/system-manage: 2856
  - src/views/app-manage: 606
  - build: 597
  - src/typings/api.d.ts: 508
  - src/router/sync-config.json: 498
  - src/service/api: 292
  - packages: 198
  - src/router/elegant: 172
  - src/docs/route-sync-test-guide.md: 162
  - package.json: 114
  - src/router/routes: 112
  - src/typings/app.d.ts: 70
  - src/views/test: 35
  - src/typings/route.d.ts: 29
- backend:
  - src/main/java: 2058
  - pom.xml: 6

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] fix: 修复同步问题并修改了菜单页面布局(未完成)
  - [undefined] stash: 为修复sync-route暂存新menu代码
  - [undefined] docs(deps): update the Vite version of the project description. (#732)
  - [undefined] feat: 优化路由同步配置，调整日志输出格式
  - [undefined] feat: 新建菜单管理模版，解决无法启动的问题
  - [undefined] feat: 实现新的终端命令pnpm sync-route
- backend:
  - [undefined] feat: 添加菜单和按钮的CRUD接口，优化相关服务实现
  - [undefined] fix: 移除lombok，解决无法编译的问题
  - [undefined] feat: 实现设备和菜单管理功能，添加相关实体、服务和控制器

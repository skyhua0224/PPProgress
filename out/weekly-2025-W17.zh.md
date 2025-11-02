# 周报（2025-04-21 至 2025-04-24）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-04-21 至 2025-04-24）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 12
触达文件总数: 34
行变更合计 +/-: +1435 / -565

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=8, files=24, +747/-379
- frontend (frontend): commits=0, files=0, +0/-0
- backend (backend): commits=4, files=10, +688/-186

## 顶层目录热力（按模块）
- admin:
  - src/views/system-manage: 719
  - build: 250
  - src/router/elegant: 35
  - src/router/sync-config.json: 33
  - src/service/api: 31
  - src/views/test: 21
  - src/typings/api.d.ts: 12
  - src/typings/elegant-router.d.ts: 6
  - src/utils/common.ts: 6
  - src/hooks/common: 4
  - .vscode: 3
  - package.json: 2
  - src/typings/common.d.ts: 2
  - README.en_US.md: 1
  - README.md: 1
- backend:
  - src/main/java: 874

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] feat: 修改gen-route和sync-route衔接逻辑
  - [undefined] feat: 完成按钮权限管理和页面排序的界面设计
  - [undefined] docs(README): Add supporting ecosystem tools to the open-source repository (#740)
  - [undefined] chore(deps): add vscode recommend plugin (#739) close #738
  - [undefined] fix(hooks): fixed the issue where loading was not properly closed in some cases. (#737)
  - [undefined] feat(types): enhance Option type to support customizable label types (#735)
  - [undefined] fix: 修复路由同步时会出现重复路由的问题
  - [undefined] feat: 新增系统信息获取和更新功能，优化菜单排序组件逻辑，进一步完成排序功能
- backend:
  - [undefined] feat(menu): 优化同步速度，添加根据 uniqueKey 删除/新增菜单的功能
  - [undefined] feat(menu): 添加菜单排序功能，支持更新菜单顺序并验证父菜单一致性
  - [undefined] fix: 修复二级目录被错误的识别为菜单的问题
  - [undefined] fix: 修复路由同步时会出现重复路由的问题

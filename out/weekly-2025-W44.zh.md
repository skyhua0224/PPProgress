# 周报（2025-10-27 至 2025-10-31）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-10-27 至 2025-10-31）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 8
触达文件总数: 29
行变更合计 +/-: +996 / -202

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=2, files=10, +455/-163
- frontend (frontend): commits=0, files=0, +0/-0
- backend (backend): commits=6, files=19, +541/-39

## 顶层目录热力（按模块）
- admin:
  - src/views/printing-center: 508
  - src/typings/api.d.ts: 43
  - src/views/order: 43
  - src/service/api: 18
  - src/typings/app.d.ts: 6
- backend:
  - src/main/java: 580

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] feat(printing-center): 补全打印中心类型与接口，重构前端页面与数据适配，从 mock 数据迁移至真实后端。
  - [undefined] feat(printing-center,order): 重构打印中心数据模型与表格展示，优化打印与详情交互
- backend:
  - [undefined] fix: 在 getPaginatedOrders 的 Specification 中仅 LEFT fetch orderItems，避免 MultipleBagFetchException；基于 AdminProfile 限制店铺权限
  - [undefined] fix: 在 getPaginatedOrders 中批量加载 orderFiles 并简化权限过滤
  - [undefined] fix: 在 getPaginatedOrders 的 Specification 中对 orderFiles/orderItems 执行 LEFT fetch（仅在非 count 查询时）并设置 distinct，避免 LazyInitializationException 和重复结果
  - [undefined] fix: 通过 PermissionRepository.findPermissionsByRoleId 从 DB 获取角色权限，避免使用可能缓存的 role.getPermissions() 集合
  - [undefined] fix: 将权限同步扫描范围限定为 controller.admin 包
  - [undefined] feat: 统一订单备注为 userRemarks 并新增打印中心功能

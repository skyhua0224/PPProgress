# 周报（2025-09-22 至 2025-09-28）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-09-22 至 2025-09-28）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 22
触达文件总数: 105
行变更合计 +/-: +3700 / -1222

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=1, files=5, +640/-138
- frontend (frontend): commits=0, files=0, +0/-0
- backend (backend): commits=21, files=100, +3060/-1084

## 顶层目录热力（按模块）
- admin:
  - src/views/order: 631
  - src/typings/api.d.ts: 117
  - src/service/api: 28
  - src/typings/components.d.ts: 2
- backend:
  - src/main/java: 3954
  - src/main/resources: 190

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] feat: 完成价格详情的页面设计
- backend:
  - [undefined] feat: 添加 JTI 服务以支持一次性令牌消费和预留，重构相关控制器和服务逻辑
  - [undefined] feat: 添加二维码数据生成逻辑，优化订单履约信息处理
  - [undefined] feat: 添加对 FulfillmentDetailDTO 中 PickupInfo 和 DeliveryInfo 类的 JsonIgnoreProperties 注解，以忽略未知属性
  - [undefined] feat: 添加通过提货码查询订单的新方法，优化原有查询逻辑
  - [undefined] refactor: 重构前端相关订单接口返回结构，支持新的二维码生成逻辑
  - [undefined] feat: 移除清理订单数据变更集中对 order_status_history 表的删除操作
  - [undefined] feat: 修复注释位置，确保在清理订单数据的变更集中正确描述外键约束
  - [undefined] feat: 更新清理订单数据的变更集，添加预条件以确保在 MySQL 中正确执行
  - [undefined] feat: 更新 PrintJobController 和 PermissionServiceImpl，添加权限注解并优化权限检查逻辑, 设置订单清理（此 commit 不适合日常使用）
  - [undefined] feat: 添加回填 numeric_pickup_code 的变更集，从 fulfillment_info JSON 中提取现有订单的取件码

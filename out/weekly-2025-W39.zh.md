# 周报（2025-09-22 至 2025-09-28）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-09-22 至 2025-09-28）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 84
触达文件总数: 84
行变更合计 +/-: +84 / -84

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=28, files=28, +28/-28
- frontend (frontend): commits=28, files=28, +28/-28
- backend (backend): commits=28, files=28, +28/-28

## 顶层目录热力（按模块）
- admin:
  - backend: 54
  - admin: 2
- frontend:
  - backend: 54
  - admin: 2
- backend:
  - backend: 54
  - admin: 2

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] [backend] 自动合并[d0b8de9: feat: 添加 JTI 服务以支持一次性令牌消费和预留，重构相关控制器和服务逻辑]\n
  - [undefined] [backend] 自动合并[dab7271: feat: 添加二维码数据生成逻辑，优化订单履约信息处理]\n
  - [undefined] [backend] 自动合并[22cfb42: feat: 添加对 FulfillmentDetailDTO 中 PickupInfo 和 DeliveryInfo 类的 JsonIgnoreProperties 注解，以忽略未知属性]\n
  - [undefined] [backend] 自动合并[72078ff: feat: 添加通过提货码查询订单的新方法，优化原有查询逻辑]\n
  - [undefined] [backend] 自动合并[c034319: refactor: 重构前端相关订单接口返回结构，支持新的二维码生成逻辑]\n
  - [undefined] [backend] 自动合并[c0c4f0a: feat: 移除清理订单数据变更集中对 order_status_history 表的删除操作]\n
  - [undefined] [backend] 自动合并[42a2512: feat: 修复注释位置，确保在清理订单数据的变更集中正确描述外键约束]\n
  - [undefined] [backend] 自动合并[dc0e6d7: feat: 更新清理订单数据的变更集，添加预条件以确保在 MySQL 中正确执行]\n
  - [undefined] [backend] 自动合并[6b593a3: feat: 更新 PrintJobController 和 PermissionServiceImpl，添加权限注解并优化权限检查逻辑, 设置订单清理（此 commit 不适合日常使用）]\n
  - [undefined] [backend] 自动合并[908017a: feat: 添加回填 numeric_pickup_code 的变更集，从 fulfillment_info JSON 中提取现有订单的取件码]\n
- frontend:
  - [undefined] [backend] 自动合并[d0b8de9: feat: 添加 JTI 服务以支持一次性令牌消费和预留，重构相关控制器和服务逻辑]\n
  - [undefined] [backend] 自动合并[dab7271: feat: 添加二维码数据生成逻辑，优化订单履约信息处理]\n
  - [undefined] [backend] 自动合并[22cfb42: feat: 添加对 FulfillmentDetailDTO 中 PickupInfo 和 DeliveryInfo 类的 JsonIgnoreProperties 注解，以忽略未知属性]\n
  - [undefined] [backend] 自动合并[72078ff: feat: 添加通过提货码查询订单的新方法，优化原有查询逻辑]\n
  - [undefined] [backend] 自动合并[c034319: refactor: 重构前端相关订单接口返回结构，支持新的二维码生成逻辑]\n
  - [undefined] [backend] 自动合并[c0c4f0a: feat: 移除清理订单数据变更集中对 order_status_history 表的删除操作]\n
  - [undefined] [backend] 自动合并[42a2512: feat: 修复注释位置，确保在清理订单数据的变更集中正确描述外键约束]\n
  - [undefined] [backend] 自动合并[dc0e6d7: feat: 更新清理订单数据的变更集，添加预条件以确保在 MySQL 中正确执行]\n
  - [undefined] [backend] 自动合并[6b593a3: feat: 更新 PrintJobController 和 PermissionServiceImpl，添加权限注解并优化权限检查逻辑, 设置订单清理（此 commit 不适合日常使用）]\n
  - [undefined] [backend] 自动合并[908017a: feat: 添加回填 numeric_pickup_code 的变更集，从 fulfillment_info JSON 中提取现有订单的取件码]\n
- backend:
  - [undefined] [backend] 自动合并[d0b8de9: feat: 添加 JTI 服务以支持一次性令牌消费和预留，重构相关控制器和服务逻辑]\n
  - [undefined] [backend] 自动合并[dab7271: feat: 添加二维码数据生成逻辑，优化订单履约信息处理]\n
  - [undefined] [backend] 自动合并[22cfb42: feat: 添加对 FulfillmentDetailDTO 中 PickupInfo 和 DeliveryInfo 类的 JsonIgnoreProperties 注解，以忽略未知属性]\n
  - [undefined] [backend] 自动合并[72078ff: feat: 添加通过提货码查询订单的新方法，优化原有查询逻辑]\n
  - [undefined] [backend] 自动合并[c034319: refactor: 重构前端相关订单接口返回结构，支持新的二维码生成逻辑]\n
  - [undefined] [backend] 自动合并[c0c4f0a: feat: 移除清理订单数据变更集中对 order_status_history 表的删除操作]\n
  - [undefined] [backend] 自动合并[42a2512: feat: 修复注释位置，确保在清理订单数据的变更集中正确描述外键约束]\n
  - [undefined] [backend] 自动合并[dc0e6d7: feat: 更新清理订单数据的变更集，添加预条件以确保在 MySQL 中正确执行]\n
  - [undefined] [backend] 自动合并[6b593a3: feat: 更新 PrintJobController 和 PermissionServiceImpl，添加权限注解并优化权限检查逻辑, 设置订单清理（此 commit 不适合日常使用）]\n
  - [undefined] [backend] 自动合并[908017a: feat: 添加回填 numeric_pickup_code 的变更集，从 fulfillment_info JSON 中提取现有订单的取件码]\n

# Weekly Report (2025-10-13 to 2025-10-19)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-10-13 to 2025-10-19)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 55
Total files touched: 71
Total lines +/-: +7595 / -447

## Per-module summary
- ProjectPrinting (.): commits=1, files=5, +1886/-99
- admin (admin): commits=18, files=22, +1903/-116
- frontend (frontend): commits=18, files=22, +1903/-116
- backend (backend): commits=18, files=22, +1903/-116

## Heat by top-level directory (per module)
- ProjectPrinting:
  - docs: 1985
- admin:
  - docs: 1985
  - backend: 28
  - frontend: 6
- frontend:
  - docs: 1985
  - backend: 28
  - frontend: 6
- backend:
  - docs: 1985
  - backend: 28
  - frontend: 6

## Commit subjects (up to 10 per module)
- ProjectPrinting:
  - [undefined] docs: 新增履约规则与店铺负载 Mockup，补充基础到店免费规则并更新订单状态文档
- admin:
  - [undefined] [backend] 自动合并[3ce0f9a: fix: getOrderStats 修正订单统计逻辑 — 待处理仅计 PENDING_PROCESS；处理中改为显式状态列表（PRINTING/READY_FOR_PICKUP/DELIVERING）；异常改为判断 OrderStatus.EXCEPTION；调整调试日志输出]\n
  - [undefined] [backend] 自动合并[8faad0f: fix: getOrderStats 使用服务器本地时间计算今日范围；抽取权限过滤为 permissionSpec 并调整统计逻辑；按权限分别统计今日总单/待处理/处理中/异常订单；新增调试打印便于定位查询范围与权限]\n
  - [undefined] [backend] 自动合并[040900c: fix: getOrderStats 使用 UTC 计算今日时间范围以匹配数据库存储；为 Store.fulfillmentSettings 添加 @JsonIgnore，防止 LAZY 加载时序列化问题]\n
  - [undefined] [backend] 自动合并[4345e35: feat: 添加管理员模拟打印完成/失败接口并实现；手动履约改为发送打印队列（状态改为 PRINTING）并支持 PENDING_PROCESS；将 EXCEPTION 纳入处理状态列表；在 OrderService 接口声明 mockPrint 方法，修复 printSpec 不出现的问题]\n
  - [undefined] [backend] 自动合并[283d059: refactor: 移除订单排队位置相关代码]\n
  - [undefined] [frontend] 自动合并[ae42984: feat: 优化排队信息显示，修复 uploadPrinting 批量设置失效的问题]\n
  - [undefined] [backend] 自动合并[6290ddf: feat: 调整每张打印耗时为 3 秒]\n
  - [undefined] [backend] 自动合并[b5cb90c: refactor: 用总页数替换基于份数的 ETA 计算并新增页数统计查询]\n
  - [undefined] [frontend] 自动合并[6401121: feat: 实现排队信息显示/远程履约支持标记，优化 uploadPrinting 上传和提交逻辑，替换排队与忙碌程度信息 mock 数据并对接后端]\n
  - [undefined] [backend] 自动合并[21a4955: fix: 修复客户端履约方式接口映射，添加 {storeId} 路径参数以匹配 @PathVariable]\n
- frontend:
  - [undefined] [backend] 自动合并[3ce0f9a: fix: getOrderStats 修正订单统计逻辑 — 待处理仅计 PENDING_PROCESS；处理中改为显式状态列表（PRINTING/READY_FOR_PICKUP/DELIVERING）；异常改为判断 OrderStatus.EXCEPTION；调整调试日志输出]\n
  - [undefined] [backend] 自动合并[8faad0f: fix: getOrderStats 使用服务器本地时间计算今日范围；抽取权限过滤为 permissionSpec 并调整统计逻辑；按权限分别统计今日总单/待处理/处理中/异常订单；新增调试打印便于定位查询范围与权限]\n
  - [undefined] [backend] 自动合并[040900c: fix: getOrderStats 使用 UTC 计算今日时间范围以匹配数据库存储；为 Store.fulfillmentSettings 添加 @JsonIgnore，防止 LAZY 加载时序列化问题]\n
  - [undefined] [backend] 自动合并[4345e35: feat: 添加管理员模拟打印完成/失败接口并实现；手动履约改为发送打印队列（状态改为 PRINTING）并支持 PENDING_PROCESS；将 EXCEPTION 纳入处理状态列表；在 OrderService 接口声明 mockPrint 方法，修复 printSpec 不出现的问题]\n
  - [undefined] [backend] 自动合并[283d059: refactor: 移除订单排队位置相关代码]\n
  - [undefined] [frontend] 自动合并[ae42984: feat: 优化排队信息显示，修复 uploadPrinting 批量设置失效的问题]\n
  - [undefined] [backend] 自动合并[6290ddf: feat: 调整每张打印耗时为 3 秒]\n
  - [undefined] [backend] 自动合并[b5cb90c: refactor: 用总页数替换基于份数的 ETA 计算并新增页数统计查询]\n
  - [undefined] [frontend] 自动合并[6401121: feat: 实现排队信息显示/远程履约支持标记，优化 uploadPrinting 上传和提交逻辑，替换排队与忙碌程度信息 mock 数据并对接后端]\n
  - [undefined] [backend] 自动合并[21a4955: fix: 修复客户端履约方式接口映射，添加 {storeId} 路径参数以匹配 @PathVariable]\n
- backend:
  - [undefined] [backend] 自动合并[3ce0f9a: fix: getOrderStats 修正订单统计逻辑 — 待处理仅计 PENDING_PROCESS；处理中改为显式状态列表（PRINTING/READY_FOR_PICKUP/DELIVERING）；异常改为判断 OrderStatus.EXCEPTION；调整调试日志输出]\n
  - [undefined] [backend] 自动合并[8faad0f: fix: getOrderStats 使用服务器本地时间计算今日范围；抽取权限过滤为 permissionSpec 并调整统计逻辑；按权限分别统计今日总单/待处理/处理中/异常订单；新增调试打印便于定位查询范围与权限]\n
  - [undefined] [backend] 自动合并[040900c: fix: getOrderStats 使用 UTC 计算今日时间范围以匹配数据库存储；为 Store.fulfillmentSettings 添加 @JsonIgnore，防止 LAZY 加载时序列化问题]\n
  - [undefined] [backend] 自动合并[4345e35: feat: 添加管理员模拟打印完成/失败接口并实现；手动履约改为发送打印队列（状态改为 PRINTING）并支持 PENDING_PROCESS；将 EXCEPTION 纳入处理状态列表；在 OrderService 接口声明 mockPrint 方法，修复 printSpec 不出现的问题]\n
  - [undefined] [backend] 自动合并[283d059: refactor: 移除订单排队位置相关代码]\n
  - [undefined] [frontend] 自动合并[ae42984: feat: 优化排队信息显示，修复 uploadPrinting 批量设置失效的问题]\n
  - [undefined] [backend] 自动合并[6290ddf: feat: 调整每张打印耗时为 3 秒]\n
  - [undefined] [backend] 自动合并[b5cb90c: refactor: 用总页数替换基于份数的 ETA 计算并新增页数统计查询]\n
  - [undefined] [frontend] 自动合并[6401121: feat: 实现排队信息显示/远程履约支持标记，优化 uploadPrinting 上传和提交逻辑，替换排队与忙碌程度信息 mock 数据并对接后端]\n
  - [undefined] [backend] 自动合并[21a4955: fix: 修复客户端履约方式接口映射，添加 {storeId} 路径参数以匹配 @PathVariable]\n

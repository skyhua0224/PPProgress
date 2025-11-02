# Weekly Report (2025-10-06 to 2025-10-12)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-10-06 to 2025-10-12)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 20
Total files touched: 111
Total lines +/-: +20554 / -1521

## Per-module summary
- ProjectPrinting (.): commits=2, files=44, +18340/-873
- admin (admin): commits=1, files=8, +935/-232
- frontend (frontend): commits=1, files=5, +336/-289
- backend (backend): commits=16, files=54, +943/-127

## Heat by top-level directory (per module)
- ProjectPrinting:
  - docs: 19021
  - analysis: 192
- admin:
  - src/views/order: 737
  - src/service/api: 212
  - src/typings/api.d.ts: 139
  - src/views/platform: 70
  - pnpm-lock.yaml: 8
  - package.json: 1
- frontend:
  - src/pages/order: 431
  - src/hooks/useOrderStatusMeta.ts: 189
  - .eslintrc-auto-import.json: 3
  - src/types/auto-import.d.ts: 2
- backend:
  - src/main/java: 807
  - src/main/resources: 263

## Commit subjects (up to 10 per module)
- ProjectPrinting:
  - [undefined] feat: 为下一阶段开发设计全新的任务指引
  - [undefined] feat: 同步订单-支付-订单状态的文档以及mockup 页面
- admin:
  - [undefined] feat: 增强履约组件管理以及订单管理，完善组件设计逻辑，分离履约组件configMode 的职责
- frontend:
  - [undefined] feat: 添加 useOrderStatusMeta hook，优化订单状态和履约类型的元数据处理，更新相关组件以使用新逻辑
- backend:
  - [undefined] feat: 添加获取所有履行类别的接口，并引入相关依赖
  - [undefined] feat: 添加 PIN_ONLY 自助打印组件，更新 fulfillment_components 表结构以包含更多字段
  - [undefined] fix: 再次回滚以确保回滚到正确的文件版本
  - [undefined] fix: 回滚以修复报错
  - [undefined] feat: 更新 fulfillment_categories 和 fulfillment_components，修复数据迁移逻辑并添加新组件
  - [undefined] feat: 更新 fulfillment_categories 数据，调整分类和组件关联以支持新逻辑
  - [undefined] feat: 更新 fulfillment_components 中的 category_id 关联，添加更多组件键并处理空值分类
  - [undefined] feat: 更新fulfillment_categories插入语句，支持重复键更新以确保数据一致性
  - [undefined] feat: 更新FulfillmentOption构造函数，添加CategoryInfo中的规则字段以支持新逻辑
  - [undefined] feat: 更新CategoryInfo类，添加SelectionRule字段并修改构造函数，更新相关服务实现以支持新字段

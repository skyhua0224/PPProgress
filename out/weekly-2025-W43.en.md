# Weekly Report (2025-10-20 to 2025-10-26)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-10-20 to 2025-10-26)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 47
Total files touched: 123
Total lines +/-: +36651 / -363

## Per-module summary
- ProjectPrinting (.): commits=2, files=21, +9153/-81
- admin (admin): commits=15, files=34, +9166/-94
- frontend (frontend): commits=15, files=34, +9166/-94
- backend (backend): commits=15, files=34, +9166/-94

## Heat by top-level directory (per module)
- ProjectPrinting:
  - docs: 7889
  - 修复前后对比详解.md: 390
  - 修复总结_FulfillmentName一致性问题.md: 307
  - 完整修复总结.md: 292
  - 修复检查清单.md: 198
  - 问题分析_FulfillmentName不一致.md: 152
  - admin: 2
  - backend: 2
  - frontend: 2
- admin:
  - docs: 7889
  - 修复前后对比详解.md: 390
  - 修复总结_FulfillmentName一致性问题.md: 307
  - 完整修复总结.md: 292
  - 修复检查清单.md: 198
  - 问题分析_FulfillmentName不一致.md: 152
  - backend: 18
  - admin: 8
  - frontend: 6
- frontend:
  - docs: 7889
  - 修复前后对比详解.md: 390
  - 修复总结_FulfillmentName一致性问题.md: 307
  - 完整修复总结.md: 292
  - 修复检查清单.md: 198
  - 问题分析_FulfillmentName不一致.md: 152
  - backend: 18
  - admin: 8
  - frontend: 6
- backend:
  - docs: 7889
  - 修复前后对比详解.md: 390
  - 修复总结_FulfillmentName一致性问题.md: 307
  - 完整修复总结.md: 292
  - 修复检查清单.md: 198
  - 问题分析_FulfillmentName不一致.md: 152
  - backend: 18
  - admin: 8
  - frontend: 6

## Commit subjects (up to 10 per module)
- ProjectPrinting:
  - [undefined] docs: 将“履约工作台”重命名为“打印中心”，重构页面设计与交付规范，补充前端组件、Mock 数据、后端接口与联调/验收流程
  - [undefined] feat: 完成打印工作台大致逻辑和功能设计
- admin:
  - [undefined] [admin] 自动合并[2c7cbad2: feat: 用 mock 数据初步完善了打印中心逻辑设计]\n
  - [undefined] [admin] 自动合并[e20a2b67: stash: 搭建打印中心骨架，完成初步页面逻辑设计]\n
  - [undefined] docs: 将“履约工作台”重命名为“打印中心”，重构页面设计与交付规范，补充前端组件、Mock 数据、后端接口与联调/验收流程
  - [undefined] [admin] 自动合并[efedf5a5: feat(order): 支持列表排序并完善手动打印/确认收货能力]\n
  - [undefined] feat: 完成打印工作台大致逻辑和功能设计
  - [undefined] [frontend] 自动合并[6e7827c: feat: 重构支付确认页履约/门店信息展示并支持 fulfillmentInfo 快照]\n
  - [undefined] [backend] 自动合并[5cba8b6: chore: 删除 changeset-V17-add-fulfillment-component-id.xml（移除为 orders 添加 fulfillment_component_id 的 Liquibase 变更集及回填脚本）]\n
  - [undefined] [backend] 自动合并[cda97ac: feat: 解决前端 PaymentConfirmation 不显示履约信息的问题]\n
  - [undefined] [backend] 自动合并[91f7f8c: feat: 为 OrderDetailV2 的 Fulfillment 添加 name/description 并在 Assembler 中根据 FulfillmentType 填充展示文案；扩展状态机允许 MANUAL_PRINTING -> COMPLETED 与 EXCEPTION -> MANUAL_PRINTING]\n
  - [undefined] [frontend] 自动合并[036a71a: refactor: 再次重构FulfilmentDisplay 样式，使其符合项目主题]\n
- frontend:
  - [undefined] [admin] 自动合并[2c7cbad2: feat: 用 mock 数据初步完善了打印中心逻辑设计]\n
  - [undefined] [admin] 自动合并[e20a2b67: stash: 搭建打印中心骨架，完成初步页面逻辑设计]\n
  - [undefined] docs: 将“履约工作台”重命名为“打印中心”，重构页面设计与交付规范，补充前端组件、Mock 数据、后端接口与联调/验收流程
  - [undefined] [admin] 自动合并[efedf5a5: feat(order): 支持列表排序并完善手动打印/确认收货能力]\n
  - [undefined] feat: 完成打印工作台大致逻辑和功能设计
  - [undefined] [frontend] 自动合并[6e7827c: feat: 重构支付确认页履约/门店信息展示并支持 fulfillmentInfo 快照]\n
  - [undefined] [backend] 自动合并[5cba8b6: chore: 删除 changeset-V17-add-fulfillment-component-id.xml（移除为 orders 添加 fulfillment_component_id 的 Liquibase 变更集及回填脚本）]\n
  - [undefined] [backend] 自动合并[cda97ac: feat: 解决前端 PaymentConfirmation 不显示履约信息的问题]\n
  - [undefined] [backend] 自动合并[91f7f8c: feat: 为 OrderDetailV2 的 Fulfillment 添加 name/description 并在 Assembler 中根据 FulfillmentType 填充展示文案；扩展状态机允许 MANUAL_PRINTING -> COMPLETED 与 EXCEPTION -> MANUAL_PRINTING]\n
  - [undefined] [frontend] 自动合并[036a71a: refactor: 再次重构FulfilmentDisplay 样式，使其符合项目主题]\n
- backend:
  - [undefined] [admin] 自动合并[2c7cbad2: feat: 用 mock 数据初步完善了打印中心逻辑设计]\n
  - [undefined] [admin] 自动合并[e20a2b67: stash: 搭建打印中心骨架，完成初步页面逻辑设计]\n
  - [undefined] docs: 将“履约工作台”重命名为“打印中心”，重构页面设计与交付规范，补充前端组件、Mock 数据、后端接口与联调/验收流程
  - [undefined] [admin] 自动合并[efedf5a5: feat(order): 支持列表排序并完善手动打印/确认收货能力]\n
  - [undefined] feat: 完成打印工作台大致逻辑和功能设计
  - [undefined] [frontend] 自动合并[6e7827c: feat: 重构支付确认页履约/门店信息展示并支持 fulfillmentInfo 快照]\n
  - [undefined] [backend] 自动合并[5cba8b6: chore: 删除 changeset-V17-add-fulfillment-component-id.xml（移除为 orders 添加 fulfillment_component_id 的 Liquibase 变更集及回填脚本）]\n
  - [undefined] [backend] 自动合并[cda97ac: feat: 解决前端 PaymentConfirmation 不显示履约信息的问题]\n
  - [undefined] [backend] 自动合并[91f7f8c: feat: 为 OrderDetailV2 的 Fulfillment 添加 name/description 并在 Assembler 中根据 FulfillmentType 填充展示文案；扩展状态机允许 MANUAL_PRINTING -> COMPLETED 与 EXCEPTION -> MANUAL_PRINTING]\n
  - [undefined] [frontend] 自动合并[036a71a: refactor: 再次重构FulfilmentDisplay 样式，使其符合项目主题]\n

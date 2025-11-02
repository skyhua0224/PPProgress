# Weekly Report (2025-08-11 to 2025-08-17)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-08-11 to 2025-08-17)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 25
Total files touched: 140
Total lines +/-: +15361 / -4109

## Per-module summary
- ProjectPrinting (.): commits=2, files=16, +3363/-609
- admin (admin): commits=4, files=42, +7039/-1753
- frontend (frontend): commits=2, files=31, +2431/-754
- backend (backend): commits=17, files=51, +2528/-993

## Heat by top-level directory (per module)
- ProjectPrinting:
  - docs: 1838
  - COUPON_CAMPAIGN_CREATE_MOCKUP_V2.md: 645
  - COUPON_CAMPAIGN_MOCKUP.md: 465
  - coupon-campaign-detail-mockup.html: 247
  - analysis: 201
  - coupon-campaign-create-mockup.html: 194
  - coupon-campaign-list-mockup.html: 143
  - COUPON_CAMPAIGN_PLAN.md: 125
  - coupon-usage-log-mockup.html: 112
  - .gitignore: 2
- admin:
  - src/views/marketing: 8038
  - src/views/store: 402
  - src/views/platform: 111
  - src/router/elegant: 55
  - src/router/sync-config.json: 54
  - src/typings/api.d.ts: 53
  - src/service/api: 35
  - src/typings/app.d.ts: 25
  - src/typings/elegant-router.d.ts: 9
  - src/locales/langs: 7
  - src/typings/components.d.ts: 3
- frontend:
  - src/pages-sub/checkout: 1819
  - src/components/AddressEditor.vue: 628
  - src/service/addressService.ts: 186
  - src/hooks/useArea.ts: 118
  - src/pages-sub/mine: 118
  - src/service/orderService.ts: 110
  - src/pages-sub/address: 74
  - src/pages/mine: 35
  - src/store/addressStore.ts: 25
  - src/store/store.ts: 16
  - src/pages-sub/filePrinting: 14
  - src/pages.json: 12
  - src/App.vue: 10
  - pnpm-lock.yaml: 8
  - .eslintrc-auto-import.json: 3
- backend:
  - src/main/java: 3508
  - pom.xml: 13

## Commit subjects (up to 10 per module)
- ProjectPrinting:
  - [undefined] feat: 上传优惠券营销 mockup 代码
  - [undefined] feat: 上传 frontend/checkout, admin/coupon新设计稿
- admin:
  - [undefined] feat: 优惠券新增和优惠券列表新增优惠券有效期功能
  - [undefined] feat: 完成优惠券列表设计，包括其编辑和详情组件设计
  - [undefined] feat: 完成全新优惠券创建管理设计
  - [undefined] at: 添加打印服务规格逻辑，优化楼宇管理功能，增强履约费
- frontend:
  - [undefined] feat: 完善地址组件，解决增删改查问题，修复 wd 组件报错问题
  - [undefined] feat: 完成全局组件AddressEditor设计，暂时使用 mock 数据提供收货信息
- backend:
  - [undefined] fix: 更新菜单同步接口路径，确保正确的请求映射
  - [undefined] feat: 更新 CouponRuleConfigConverter，增强 ObjectMapper 配置，改进异常处理逻辑
  - [undefined] feat: 设计优惠券活动发布接口，以替换旧的优惠券发布系列接口，并增强优惠券实体添加有效期字段
  - [undefined] feat: 更新优惠券查询接口，支持根据名称和状态过滤，重构查询逻辑
  - [undefined] refactor: 重构优惠券相关代码，移除过时字段和方法，简化逻辑，更新优惠券描述处理
  - [undefined] feat: 更新优惠券相关类，添加颜色属性，重构优惠券类型处理逻辑，移除过时字段和方法
  - [undefined] feat: 添加 CouponRuleConfigConverter，用于处理 Coupon 的 JSON 类型配置
  - [undefined] refactor: 重构优惠券代码，包含优惠券创建接口及相关DTO，更新优惠券状态枚举，支持JSON类型配置，使用新的组件价格设计
  - [undefined] feat: 更新 User 实体，修改地址集合的 JSON 序列化策略，避免循环引用
  - [undefined] feat: 更新 UserAddressController，统一返回类型为 ResponseData，简化响应处理

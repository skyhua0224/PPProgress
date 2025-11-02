# Weekly Report (2025-08-18 to 2025-08-24)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-08-18 to 2025-08-24)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 33
Total files touched: 151
Total lines +/-: +5629 / -2569

## Per-module summary
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=4, files=51, +3150/-1521
- frontend (frontend): commits=1, files=4, +215/-130
- backend (backend): commits=28, files=96, +2264/-918

## Heat by top-level directory (per module)
- admin:
  - src/views/marketing: 2364
  - src/views/system: 966
  - src/service/api: 735
  - src/components/business: 298
  - src/typings/api.d.ts: 126
  - src/locales/langs: 111
  - src/typings/app.d.ts: 18
  - src/router/sync-config.json: 13
  - src/router/elegant: 11
  - pnpm-lock.yaml: 9
  - src/typings/components.d.ts: 8
  - src/typings/marketing-augmentation.d.ts: 8
  - src/typings/elegant-router.d.ts: 2
  - src/typings/abc.code-profile: 1
  - package.json: 1
- frontend:
  - src/pages-sub/mine: 206
  - src/service/userService.ts: 92
  - src/utils/http.ts: 46
  - src/store/user.ts: 1
- backend:
  - src/main/java: 3168
  - pom.xml: 14

## Commit subjects (up to 10 per module)
- admin:
  - [undefined] feat: 新增客户等级管理页面，用于更好的管理组内逻辑中的会员等级福利
  - [undefined] feat: 增强优惠券发放功能，新增状态/补救等功能
  - [undefined] fix: 修复优惠券系列代码可见问题
  - [undefined] feat: 完善优惠券发布有关用户方面的代码，重新整理用户接口逻辑与实体，重构部分用户管理代码
- frontend:
  - [undefined] feat: 修改用户相关代码，使其符合新的用户表结构，优化初始化流程
- backend:
  - [undefined] feat: 添加 targetLevels 属性到 CouponCampaignDto、CouponCampaignResponseDto 和 CouponCampaign 实体，支持会员等级管理
  - [undefined] feat: 更新 ClientLevel 实体类，修改 benefits 属性类型为 String，并添加 JSON 转换逻辑
  - [undefined] fix: 更新 hypersistence-utils-hibernate-60 依赖版本至 3.7.0
  - [undefined] feat: 添加 ClientLevel 实体类，定义客户端等级的属性和方法
  - [undefined] feat: 添加 ClientLevel 相关功能，包括 DTO、服务、控制器和仓库，实现客户端等级管理
  - [undefined] feat: 添加 ClientPickerDTO 类，支持从 User 对象构建客户端选择器数据传输对象
  - [undefined] feat: 添加客户端搜索功能，支持根据关键字查询用户
  - [undefined] feat: 添加 ItemConstraint 以支持更灵活的优惠券规则，优化订单计算逻辑
  - [undefined] feat: 添加 appendAuditTag 方法，优化 updatedBy 字段的处理，避免数据库截断
  - [undefined] fix: 修复 CampaignOperationLog 中的 JsonIgnore 注解，避免循环引用问题

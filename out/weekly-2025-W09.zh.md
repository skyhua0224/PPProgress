# 周报（2025-02-24 至 2025-02-28）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-02-24 至 2025-02-28）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 15
触达文件总数: 491
行变更合计 +/-: +4205 / -140454

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=2, files=17, +817/-34
- frontend (frontend): commits=11, files=460, +2360/-140400
- backend (backend): commits=2, files=14, +1028/-20

## 顶层目录热力（按模块）
- admin:
  - src/views/app-manage: 718
  - src/service/api: 91
  - src/typings/api.d.ts: 22
  - src/router/elegant: 12
  - src/locales/langs: 4
  - src/typings/elegant-router.d.ts: 2
  - src/typings/app.d.ts: 2
  - src/main/java: 0
- frontend:
  - src/utils/pdf: 138160
  - src/pages-sub/filePrinting: 1017
  - src/pages-sub/mine: 748
  - src/pages/library: 598
  - pnpm-lock.yaml: 497
  - src/pages/mine: 469
  - src/components/VoucherCard.vue: 144
  - src/pages/home: 110
  - src/components/CustomNavBar.vue: 106
  - src/pages.json: 75
  - src/components/fg-tabbar: 74
  - src/service/couponService.ts: 72
  - src/pages-sub/address: 64
  - pages.config.ts: 59
  - src/components/CustomTabBar.vue: 58
- backend:
  - src/main/java: 1048

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] feat: 添加配送费管理功能，包含API接口、国际化支持和视图组件
  - [undefined] feat: 添加生成兑换码功能，优化优惠券管理界面，增强角色选择和用户组功能
- frontend:
  - [undefined] feat: 新增价格表组件以展示商品列表
  - [undefined] feat: 优化登录流程，确保用户信息同步更新至store和本地存储
  - [undefined] feat: 更新环境变量为生产地址，优化优惠券页面布局和样式
  - [undefined] feat: 更新页面配置，添加首页类型，全局化导航栏组件，修复上传页面的actionBar
  - [undefined] delete: 删除废弃的pdf文件
  - [undefined] refactor: 重构资料库界面
  - [undefined] fix: 修复了pnpm i之后微信无法编译的错
  - [undefined] feat: 为多个组件添加悬停效果，优化按钮交互体验
  - [undefined] feat: 重构优惠券选择页面，优化样式和逻辑，增加优惠券有效性检查
  - [undefined] feat: 优化首页功能按钮布局和样式，更新打印选项描述，调整选择打印来源页面样式
- backend:
  - [undefined] feat: 新增配送费用管理功能，包含配送费用实体、仓库和服务，支持固定价格和公式计算方式
  - [undefined] feat: 增强用户和优惠券管理功能，新增用户关联和获取用户优惠券接口

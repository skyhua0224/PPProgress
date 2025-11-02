# Weekly Report (2025-02-17 to 2025-02-20)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-02-17 to 2025-02-20)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 19
Total files touched: 111
Total lines +/-: +5614 / -2171

## Per-module summary
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=6, files=29, +1185/-374
- frontend (frontend): commits=9, files=43, +2342/-1715
- backend (backend): commits=4, files=39, +2087/-82

## Heat by top-level directory (per module)
- admin:
  - src/views/app-manage: 865
  - src/views/system-manage: 308
  - src/service/api: 204
  - src/locales/langs: 79
  - src/typings/api.d.ts: 54
  - src/typings/app.d.ts: 32
  - src/router/elegant: 13
  - src/layouts/modules: 2
  - src/typings/elegant-router.d.ts: 2
- frontend:
  - src/pages-sub/checkout: 2264
  - src/pages-sub/filePrinting: 1489
  - src/typings.ts: 110
  - src/components/PaymentFooter.vue: 95
  - src/service/storeService.ts: 56
  - src/types/file.ts: 36
  - src/pages.json: 4
  - tsconfig.json: 2
  - src/types/uni-pages.d.ts: 1
  - src/{pages-sub/checkout => static: 0
- backend:
  - src/main/java: 2138
  - pom.xml: 14
  - src/main/resources: 12
  - .spring-api-helper.json: 5

## Commit subjects (up to 10 per module)
- admin:
  - [undefined] feat: 添加角色管理功能，包含角色响应接口和批量删除角色的实现，优化角色数据处理
  - [undefined] feat: 添加优惠券发布功能，支持发布到所有用户、特定用户、用户组及条件发布（代码还存在报错但可使用）
  - [undefined] feat(projects): tab support touch event
  - [undefined] feat: 更新门店创建和编辑接口，简化数据结构并调整API路径
  - [undefined] feat: 添加门店管理功能，包含API接口、国际化支持和视图组件
  - [undefined] feat: 添加门店管理功能，包含路由、API和视图
- frontend:
  - [undefined] feat: 优化配送方式选择逻辑，增加自助点提示，调整布局和样式
  - [undefined] feat: 更新获取店铺列表的响应字段，改为使用records替代stores
  - [undefined] feat: 更新获取店铺列表的API路径，改为/all
  - [undefined] feat: 优化结账页面逻辑，重构价格参数获取，调整店铺卡片布局
  - [undefined] feat: 替换SVG图标为wd-icon组件，优化支付页面样式和布局
  - [undefined] feat: 添加基础打印价格显示，优化店铺类型映射逻辑，获取默认旗舰店
  - [undefined] feat: 将svg文件合并至vue以减少HTTP请求
  - [undefined] feat: 优化文件图标获取逻辑，重构文件上传处理，更新相关事件处理函数
  - [undefined] feat: 添加店铺选择页面和相关组件，优化文件上传功能，更新类型定义
- backend:
  - [undefined] feat: 新增优惠券兑换码和发布范围相关的实体及仓库，增强角色管理功能
  - [undefined] feat: 新增店铺创建和更新功能，使用DTO封装请求数据，增强数据验证
  - [undefined] feat: 新增商店管理功能，包括商店实体、服务和仓库，支持分页查询和状态过滤
  - [undefined] feat: 新增订单相关枚举和字段，支持配送类型和打印状态管理

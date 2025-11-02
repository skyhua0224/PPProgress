# 周报（2025-03-03 至 2025-03-07）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-03-03 至 2025-03-07）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 24
触达文件总数: 194
行变更合计 +/-: +4387 / -2041

## 按模块汇总
- ProjectPrinting (.): commits=5, files=12, +366/-245
- admin (admin): commits=7, files=23, +1645/-1578
- frontend (frontend): commits=4, files=9, +959/-117
- backend (backend): commits=8, files=150, +1417/-101

## 顶层目录热力（按模块）
- ProjectPrinting:
  - README.md: 292
  - .github: 256
  - .gitignore: 41
  - .gitmodules: 15
  - admin: 2
  - backend: 2
  - frontend: 2
  - uml: 1
- admin:
  - pnpm-lock.yaml: 2247
  - src/locales/langs: 341
  - src/views/app-manage: 322
  - src/typings/app.d.ts: 175
  - package.json: 38
  - src/typings/api.d.ts: 35
  - .github: 23
  - src/router/elegant: 20
  - packages: 12
  - uno.config.ts: 4
  - src/service/api: 4
  - src/layouts/modules: 2
- frontend:
  - src/pages-sub/checkout: 833
  - src/service/deliveryConfigService.ts: 143
  - src/service/orderService.ts: 68
  - .github: 25
  - src/service/storeService.ts: 7
- backend:
  - src/main/java: 1456
  - target: 23
  - .github: 23
  - .vscode: 16

## 提交主题（每模块最多 10 条）
- ProjectPrinting:
  - [undefined] Update README.md
  - [undefined] feat: 更新 README.md，添加项目介绍及功能说明
  - [undefined] feat: 修改 Action生成的commit信息
  - [undefined] feat: 修改GitHub主仓库自动同步
  - [undefined] chore: 更新子模块配置，删除uml子模块并添加自动同步工作流
- admin:
  - [undefined] feat:修改页面中文
  - [undefined] feat: 修改GitHub主仓库自动同步
  - [undefined] feat: 添加配送费管理路由，添加GitHub主仓库自动同步
  - [undefined] chore(projects): update unocss preset (#712)
  - [undefined] chore(deps): update deps
  - [undefined] feat: 添加优惠券状态管理，更新状态标签和国际化支持，优化有效期显示
  - [undefined] feat: 添加店铺取货方式功能，更新店铺接口，优化取货方式展示
- frontend:
  - [undefined] feat: 修改GitHub主仓库自动同步
  - [undefined] feat: 支持获取配送配置列表和楼宇信息，添加GitHub自动同步
  - [undefined] feat: 优化配送费用计算逻辑，支持多种取货方式
  - [undefined] feat: 添加店铺取货方式功能
- backend:
  - [undefined] 将PPBackend重命名为ppbackend
  - [undefined] fix: 删除误上传的target文件夹
  - [undefined] feat: 增强子模块更新通知，添加SHA信息到负载中
  - [undefined] feat: 新增子模块推送时通知主仓库的工作流
  - [undefined] feat: 新增根据店铺ID、类型和楼宇类型查找楼宇的功能，增强楼宇管理
  - [undefined] feat: 新增配送配置和楼宇管理功能
  - [undefined] fix: 修复了 store发送的是description而不是enums原文的问题
  - [undefined] feat: 新增店铺取货方式管理功能，包含取货方式类型和取货方式列表，增强数据验证

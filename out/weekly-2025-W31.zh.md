# 周报（2025-07-28 至 2025-08-03）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-07-28 至 2025-08-03）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 65
触达文件总数: 386
行变更合计 +/-: +9072 / -6848

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=5, files=162, +4471/-5417
- frontend (frontend): commits=0, files=0, +0/-0
- backend (backend): commits=60, files=224, +4601/-1431

## 顶层目录热力（按模块）
- admin:
  - src/views/app-manage: 4364
  - src/views/store: 1571
  - src/views/platform: 1477
  - src/router/elegant: 708
  - src/router/sync-config.json: 597
  - src/components/business: 282
  - src/service/api: 257
  - src/typings/api.d.ts: 170
  - src/typings/elegant-router.d.ts: 132
  - src/locales/langs: 115
  - src/hooks/business: 69
  - src/theme/settings.ts: 63
  - packages: 30
  - src/views/test: 28
  - pnpm-lock.yaml: 19
- backend:
  - src/main/java: 5894
  - pom.xml: 138

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] feat: 优化配置履约流程
  - [undefined] feat: 完成店铺履约管理设计
  - [undefined] feat: 完成平台管理-模版管理/履约组件管理设计，修正服务组件管理，完善自动/手动同步路由脚本
  - [undefined] refactor: 清理文件结构，使其符合新的菜单目录设计
  - [undefined] refactor: 重构admin菜单结构，为新价格页面建立页面
- backend:
  - [undefined] refactor: 更新StorePriceItemDTO中的价格范围类型为double数组，并在PriceManageServiceImpl中相应调整价格处理逻辑
  - [undefined] feat: 支持服务组件价格范围设置
  - [undefined] refactor: 移除ServiceComponentPriceDTO，优化价格模板解析逻辑，使用Map结构处理服务配置
  - [undefined] refactor: 更新ServiceComponentPriceDTO中的价格类型为BigDecimal，并在PriceManageServiceImpl和TemplateServiceImpl中相应调整价格处理逻辑
  - [undefined] refactor: 在PriceManageServiceImpl中引入StoreServiceSettingRepository，优化获取商店价格的逻辑，支持根据启用状态筛选服务设置
  - [undefined] refactor: 优化PriceManageController的请求映射以统一API路径；移除ServiceOption中的不必要的价格关联
  - [undefined] refactor: 重构价格管理模块，更新DTO和实体类以支持价格更新功能；优化PriceManageServiceImpl中的价格获取和更新逻辑
  - [undefined] refactor: 更新MenuRepository的查询以预加载权限；在MenuServiceImpl中为getAllEnabledRoutes方法添加只读事务注解以提高性能
  - [undefined] refactor: 更新MenuController的请求映射以优化API路径；在MenuManageService中添加检查路由存在性的方法；在MenuManageServiceImpl中实现该方法
  - [undefined] refactor: 在MenuRepository中更新查询以预加载权限；在MenuServiceImpl中为getUserRoutes方法添加只读事务注解以提高性能

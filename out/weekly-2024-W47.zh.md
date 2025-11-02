# 周报（2024-11-18 至 2024-11-22）

## 开发进展

# 开发进展 — 主仓与子模块（自 2024-11-18 至 2024-11-22）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 8
触达文件总数: 95
行变更合计 +/-: +2115 / -1205

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=2, files=28, +820/-572
- frontend (frontend): commits=3, files=23, +1170/-451
- backend (backend): commits=3, files=44, +125/-182

## 顶层目录热力（按模块）
- admin:
  - src/views/app-manage: 1177
  - src/service/api: 117
  - src/locales/langs: 41
  - src/typings/app.d.ts: 18
  - src/views/user-manage: 14
  - src/typings/api.d.ts: 10
  - .env.test: 6
  - .vscode: 6
  - .env.prod: 2
  - eslint.config.js: 1
- frontend:
  - src/pages-sub/mine: 1298
  - src/components/VoucherCard.vue: 227
  - src/service/couponService.ts: 40
  - src/pages.json: 22
  - src/interceptors/request.ts: 15
  - src/types/uni-pages.d.ts: 7
  - src/utils/http.ts: 6
  - env: 2
  - index.html: 2
  - src/pages/mine: 2
  - .DS_Store: 0
  - src/.DS_Store: 0
  - src/pages-sub/.DS_Store: 0
  - src/pages/.DS_Store: 0
  - src/router/index.ts: 0
- backend:
  - target: 177
  - src/main/java: 114
  - pom.xml: 10
  - .vscode: 6

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] style: 修复一些warning
  - [undefined] feat: 使用SSL加密后端地址
- frontend:
  - [undefined] feat: 更新优惠券获取逻辑，增加安全检查和错误处理
  - [undefined] feat: 添加优惠券规则和过期优惠券页面
  - [undefined] feat: 地址管理
- backend:
  - [undefined] style: 修复一些warning
  - [undefined] feat: 更新应用程序配置，添加时区设置，启用定时任务，修改优惠券过期日期字段，支持多个跨域请求
  - [undefined] style: 修复一些warring

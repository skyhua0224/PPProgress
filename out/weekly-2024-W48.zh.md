# 周报（2024-11-25 至 2024-11-28）

## 开发进展

# 开发进展 — 主仓与子模块（自 2024-11-25 至 2024-11-28）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 9
触达文件总数: 1967
行变更合计 +/-: +187638 / -187540

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=0, files=0, +0/-0
- frontend (frontend): commits=7, files=1959, +187407/-187538
- backend (backend): commits=2, files=8, +231/-2

## 顶层目录热力（按模块）
- frontend:
  - dist: 365128
  - pnpm-lock.yaml: 6281
  - src/pages/mine: 890
  - src/pages-sub/mine: 722
  - src/pages/order: 539
  - src/types/auto-import.d.ts: 271
  - src/pages-sub/filePrinting: 209
  - package.json: 115
  - src/pages.json: 108
  - src/pages-sub/checkout: 101
  - src/pages/home: 92
  - src/pages/library: 86
  - pages.config.ts: 82
  - src/mock/index.js: 70
  - vite.config.ts: 55
- backend:
  - src/main/java: 225
  - target: 5
  - src/main/resources: 3

## 提交主题（每模块最多 10 条）
- frontend:
  - [undefined] feat: 更新微信小程序appid，移除分类页面相关配置，修改优惠券接口地址，升级依赖版本
  - [undefined] stash: 暂存微信登录设置
  - [undefined] feat: 更新商品管理界面
  - [undefined] feat: 修改我的页面，替换所有的router-link为button
  - [undefined] 修改bug
  - [undefined] feat: 优化代码结构，移除未使用的导入，添加地址编辑页面
  - [undefined] feat: 更新地址管理
- backend:
  - [undefined] feat: 添加微信登录，更新用户模型，增加角色类型枚举
  - [undefined] feat: 添加从字符串值转换为优惠券状态的静态方法

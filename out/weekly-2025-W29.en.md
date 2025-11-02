# Weekly Report (2025-07-14 to 2025-07-20)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-07-14 to 2025-07-20)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 66
Total files touched: 214
Total lines +/-: +10840 / -2143

## Per-module summary
- ProjectPrinting (.): commits=1, files=25, +7394/-1
- admin (admin): commits=4, files=32, +1065/-750
- frontend (frontend): commits=0, files=0, +0/-0
- backend (backend): commits=61, files=157, +2381/-1392

## Heat by top-level directory (per module)
- ProjectPrinting:
  - docs: 7394
  - .gitignore: 1
- admin:
  - src/views/system-manage: 1435
  - src/components/custom: 158
  - src/service/api: 75
  - src/typings/api.d.ts: 43
  - src/plugins/permission.ts: 38
  - src/locales/langs: 14
  - pnpm-workspace.yaml: 13
  - src/typings/app.d.ts: 12
  - src/service/request: 8
  - src/plugins/index.ts: 8
  - pnpm-lock.yaml: 6
  - src/typings/components.d.ts: 3
  - package.json: 2
- backend:
  - src/main/java: 3316
  - src/main/resources: 423
  - pom.xml: 33
  - .mvn: 1

## Commit subjects (up to 10 per module)
- ProjectPrinting:
  - [undefined] feat: 上传文档以方便开发查阅
- admin:
  - [undefined] feat: 完成用户管理权限改造，样式美化
  - [undefined] feat: 添加权限控制指令，支持基于权限的元素显示控制，完成菜单/页面按权限码控制显示
  - [undefined] feat: JWT Token 过期后重定向至登录页面
  - [undefined] feat: 完成角色管理页面设计，添加全局组件权限码选择器
- backend:
  - [undefined] feat: 更新AdminProfile和User类，优化关联关系，确保角色信息始终可用
  - [undefined] feat: 重构用户管理接口，新增获取管理员和客户端用户的方法，优化查询逻辑以支持不同用户类型
  - [undefined] feat: 在User类中添加AdminProfile字段，并在UserService中优化查询以预加载AdminProfiles，避免N+1查询
  - [undefined] feat: 添加获取所有角色的接口，并简化RoleService中的getAllRoles方法
  - [undefined] refactor: 更新getMenuTree方法以仅返回非常量菜单，并优化getUserRoutes方法以使用新的菜单树
  - [undefined] feat: 添加ensureAdminProfileForSuperUser方法以确保R_SUPER用户拥有AdminProfile，支持V6迁移
  - [undefined] refactor: 将MenuVO中的constant字段重命名为isConstant，并更新相关getter和setter方法；在MenuSyncService中调整同步逻辑以使用新字段
  - [undefined] refactor: 将Menu类中的constant字段重命名为isConstant，并更新相关方法；优化MenuRepository和MenuServiceImpl中的查询逻辑以使用新字段
  - [undefined] refactor: 移除JwtAuthenticationFilter中的公共路径匹配器，简化身份验证逻辑
  - [undefined] refactor: 优化SecurityConfig构造函数格式，增加换行以提升可读性；更新默认安全过滤链以允许访问/api/menus/constant

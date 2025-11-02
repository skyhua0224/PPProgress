# Weekly Report (2025-07-14 to 2025-07-20)

## Dev progress (ProjectPrinting + submodules)

# Dev progress — ProjectPrinting + submodules (from 2025-07-14 to 2025-07-20)

Modules scanned: ProjectPrinting, admin, frontend, backend
Total commits: 190
Total files touched: 289
Total lines +/-: +29765 / -193

## Per-module summary
- ProjectPrinting (.): commits=1, files=25, +7394/-1
- admin (admin): commits=63, files=88, +7457/-64
- frontend (frontend): commits=63, files=88, +7457/-64
- backend (backend): commits=63, files=88, +7457/-64

## Heat by top-level directory (per module)
- ProjectPrinting:
  - docs: 7394
  - .gitignore: 1
- admin:
  - docs: 7394
  - backend: 116
  - admin: 10
  - .gitignore: 1
- frontend:
  - docs: 7394
  - backend: 116
  - admin: 10
  - .gitignore: 1
- backend:
  - docs: 7394
  - backend: 116
  - admin: 10
  - .gitignore: 1

## Commit subjects (up to 10 per module)
- ProjectPrinting:
  - [undefined] feat: 上传文档以方便开发查阅
- admin:
  - [undefined] [backend] 自动合并[2d91298: feat: 更新AdminProfile和User类，优化关联关系，确保角色信息始终可用]\n
  - [undefined] [backend] 自动合并[b41ac97: feat: 重构用户管理接口，新增获取管理员和客户端用户的方法，优化查询逻辑以支持不同用户类型]\n
  - [undefined] [backend] 自动合并[29d4e80: feat: 在User类中添加AdminProfile字段，并在UserService中优化查询以预加载AdminProfiles，避免N+1查询]\n
  - [undefined] [backend] 自动合并[46e7393: feat: 添加获取所有角色的接口，并简化RoleService中的getAllRoles方法]\n
  - [undefined] [admin] 自动合并[0431abe5: feat: 替换原adminRole方案，使用新的AdminProfile判断用户是否为管理员]\n
  - [undefined] [backend] 自动合并[7beb5b3: refactor: 更新getMenuTree方法以仅返回非常量菜单，并优化getUserRoutes方法以使用新的菜单树]\n
  - [undefined] [backend] 自动合并[e5ac236: feat: 添加ensureAdminProfileForSuperUser方法以确保R_SUPER用户拥有AdminProfile，支持V6迁移]\n
  - [undefined] [backend] 自动合并[5732ace: refactor: 将MenuVO中的constant字段重命名为isConstant，并更新相关getter和setter方法；在MenuSyncService中调整同步逻辑以使用新字段]\n
  - [undefined] [backend] 自动合并[cce3c67: refactor: 将Menu类中的constant字段重命名为isConstant，并更新相关方法；优化MenuRepository和MenuServiceImpl中的查询逻辑以使用新字段]\n
  - [undefined] [backend] 自动合并[a19804a: refactor: 移除JwtAuthenticationFilter中的公共路径匹配器，简化身份验证逻辑]\n
- frontend:
  - [undefined] [backend] 自动合并[2d91298: feat: 更新AdminProfile和User类，优化关联关系，确保角色信息始终可用]\n
  - [undefined] [backend] 自动合并[b41ac97: feat: 重构用户管理接口，新增获取管理员和客户端用户的方法，优化查询逻辑以支持不同用户类型]\n
  - [undefined] [backend] 自动合并[29d4e80: feat: 在User类中添加AdminProfile字段，并在UserService中优化查询以预加载AdminProfiles，避免N+1查询]\n
  - [undefined] [backend] 自动合并[46e7393: feat: 添加获取所有角色的接口，并简化RoleService中的getAllRoles方法]\n
  - [undefined] [admin] 自动合并[0431abe5: feat: 替换原adminRole方案，使用新的AdminProfile判断用户是否为管理员]\n
  - [undefined] [backend] 自动合并[7beb5b3: refactor: 更新getMenuTree方法以仅返回非常量菜单，并优化getUserRoutes方法以使用新的菜单树]\n
  - [undefined] [backend] 自动合并[e5ac236: feat: 添加ensureAdminProfileForSuperUser方法以确保R_SUPER用户拥有AdminProfile，支持V6迁移]\n
  - [undefined] [backend] 自动合并[5732ace: refactor: 将MenuVO中的constant字段重命名为isConstant，并更新相关getter和setter方法；在MenuSyncService中调整同步逻辑以使用新字段]\n
  - [undefined] [backend] 自动合并[cce3c67: refactor: 将Menu类中的constant字段重命名为isConstant，并更新相关方法；优化MenuRepository和MenuServiceImpl中的查询逻辑以使用新字段]\n
  - [undefined] [backend] 自动合并[a19804a: refactor: 移除JwtAuthenticationFilter中的公共路径匹配器，简化身份验证逻辑]\n
- backend:
  - [undefined] [backend] 自动合并[2d91298: feat: 更新AdminProfile和User类，优化关联关系，确保角色信息始终可用]\n
  - [undefined] [backend] 自动合并[b41ac97: feat: 重构用户管理接口，新增获取管理员和客户端用户的方法，优化查询逻辑以支持不同用户类型]\n
  - [undefined] [backend] 自动合并[29d4e80: feat: 在User类中添加AdminProfile字段，并在UserService中优化查询以预加载AdminProfiles，避免N+1查询]\n
  - [undefined] [backend] 自动合并[46e7393: feat: 添加获取所有角色的接口，并简化RoleService中的getAllRoles方法]\n
  - [undefined] [admin] 自动合并[0431abe5: feat: 替换原adminRole方案，使用新的AdminProfile判断用户是否为管理员]\n
  - [undefined] [backend] 自动合并[7beb5b3: refactor: 更新getMenuTree方法以仅返回非常量菜单，并优化getUserRoutes方法以使用新的菜单树]\n
  - [undefined] [backend] 自动合并[e5ac236: feat: 添加ensureAdminProfileForSuperUser方法以确保R_SUPER用户拥有AdminProfile，支持V6迁移]\n
  - [undefined] [backend] 自动合并[5732ace: refactor: 将MenuVO中的constant字段重命名为isConstant，并更新相关getter和setter方法；在MenuSyncService中调整同步逻辑以使用新字段]\n
  - [undefined] [backend] 自动合并[cce3c67: refactor: 将Menu类中的constant字段重命名为isConstant，并更新相关方法；优化MenuRepository和MenuServiceImpl中的查询逻辑以使用新字段]\n
  - [undefined] [backend] 自动合并[a19804a: refactor: 移除JwtAuthenticationFilter中的公共路径匹配器，简化身份验证逻辑]\n

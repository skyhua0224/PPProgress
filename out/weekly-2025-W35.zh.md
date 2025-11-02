# 周报（2025-08-25 至 2025-08-31）

## 开发进展

# 开发进展 — 主仓与子模块（自 2025-08-25 至 2025-08-31）

扫描的模块: ProjectPrinting, admin, frontend, backend
提交总数: 61
触达文件总数: 288
行变更合计 +/-: +14329 / -2484

## 按模块汇总
- ProjectPrinting (.): commits=0, files=0, +0/-0
- admin (admin): commits=2, files=16, +1900/-444
- frontend (frontend): commits=3, files=22, +3157/-486
- backend (backend): commits=56, files=250, +9272/-1554

## 顶层目录热力（按模块）
- admin:
  - src/views/marketing: 1565
  - src/components/user: 439
  - src/service/api: 189
  - src/components/business: 133
  - types: 8
  - src/typings/api.d.ts: 5
  - src/router/sync-config.json: 4
  - src/typings/components.d.ts: 1
- frontend:
  - src/pages-sub/mine: 883
  - src/components/CouponCenter.vue: 864
  - src/components/CouponCodeRedeemPopup.vue: 567
  - src/components/CouponCard.vue: 449
  - src/pages-sub/checkout: 444
  - src/service/couponService.ts: 324
  - src/components/CouponPicker.vue: 66
  - src/style/index.scss: 24
  - src/components/CustomNavBar.vue: 11
  - src/utils/requestWithAuth.ts: 5
  - src/types/components.d.ts: 4
  - src/service/orderService.ts: 2
- backend:
  - src/main/java: 10010
  - src/main/resources: 388
  - docs: 264
  - pom.xml: 130
  - src/test/java: 34

## 提交主题（每模块最多 10 条）
- admin:
  - [undefined] feat: 完善优惠券活动页面逻辑，支持查看和复制优惠券，选择仅查看归档优惠券，查看一码一用的兑换码列表并导出为 csv
  - [undefined] feat(coupon-campaign): 优化优惠券活动页面设计，适配新的后端结构
- frontend:
  - [undefined] feat: 支持优惠券兑换功能，完善优惠券体系样式设计
  - [undefined] feat: 完成优惠券前端样式制作，优惠券对应接口处于对接阶段
  - [undefined] feat: 完成优惠券前端样式制作，优惠券对应接口处于对接阶段
- backend:
  - [undefined] feat: 添加默认构造函数以支持 Jackson 反序列化，并忽略未知属性
  - [undefined] feat: 更新获取店铺服务项的逻辑，支持从缓存反序列化的 LinkedHashMap 转换为 StorePriceItemDTO
  - [undefined] feat: 移除 Jackson 默认类型启用，避免反序列化时的安全风险和错误
  - [undefined] feat: 启用 Jackson 类型信息以支持 DTO 对象的正确反序列化；更新缓存策略以避免空结果
  - [undefined] feat: 添加日志记录以捕获获取履约方式、店铺设置选项和店铺服务的错误
  - [undefined] feat: 将 RedisTemplate 替换为 StringRedisTemplate，以优化速率限制逻辑
  - [undefined] feat: 禁用 Spring Data Redis 仓库自动配置以避免启动警告
  - [undefined] feat: 更新 Liquibase 配置，使用属性文件管理数据库连接信息
  - [undefined] feat: 添加 Liquibase 依赖并配置数据库变更日志，更新 application.properties 文件
  - [undefined] fix: 将 Spring Boot 版本从 4.0.0-M2 降级至 3.5.5，以解决兼容性问题

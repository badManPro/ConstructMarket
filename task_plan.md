# Task Plan: 建材市场微信小程序前端 PRD 输出

## Goal
产出一份可直接指导微信原生小程序前端设计与开发的建材市场 PRD，并保存到项目内。

## Current Phase
Phase 5

## Phases
### Phase 1: Requirements & Discovery
- [x] 理解用户目标与交付物
- [x] 以 `docs/mind.png` 为主梳理需求范围
- [x] 用 `docs/pencil` 补充页面形态参考
- **Status:** complete

### Phase 2: Planning & Structure
- [x] 确定 PRD 文档结构
- [x] 确定页面清单、路由清单与数据模型范围
- [x] 明确只覆盖前端、全部使用 Mock 数据
- **Status:** complete

### Phase 3: Implementation
- [x] 创建项目内规划文件
- [x] 编写正式 PRD 文档
- [x] 补全页面功能、交互、状态、Mock 字段
- **Status:** complete

### Phase 4: Testing & Verification
- [x] 自检文档完整性
- [x] 核对是否覆盖脑图全部模块
- [x] 核对是否满足“只考虑前端”的约束
- **Status:** complete

### Phase 5: Delivery
- [x] 确认输出文件路径
- [x] 总结本次新增文件
- [x] 向用户交付
- **Status:** complete

## Key Questions
1. 脑图中的页面能力如何映射为可开发的小程序页面与弹层？
2. 在只做前端、全部 Mock 的前提下，需要定义哪些数据模型和全局状态？
3. 哪些竞品页面只能作为视觉/交互参考，不能反向推导需求？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 以 `docs/mind.png` 作为一级需求来源 | 用户已明确“主要还是 mind 图，其他的都是参考” |
| `docs/pencil` 仅用于页面形态补充 | 避免将竞品中的审批、消息等能力误写为硬需求 |
| 按企业/工程采购型商城编写 PRD | 与建材市场场景、发票和地址管理能力更匹配 |
| V1 按脑图全量覆盖 | 用户给出的既定实施方案要求全量覆盖 |
| 交易模式按直接下单支付为主 | 已有既定计划，且能覆盖购物车、结算、支付结果链路 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| `pencil/batch_get` 无法连接桌面 app | 1 | 改为直接读取 `miniapp.pen` JSON 和查看静态图片 |

## Notes
- PRD 输出路径：`docs/PRD-建材市场小程序前端.md`
- 需要显式给出页面目标、入口、核心模块、交互、空态/异常态、跳转和 Mock 字段
- 需要给出可直接拆分 `pages` 配置的路由清单
- 已完成文件级自检，PRD 共 1078 行

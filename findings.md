# Findings: 建材市场微信小程序 PRD

## Source of Truth
- 主需求来源是 `/Users/casper/Documents/self/ConstructMarket/docs/mind.png`
- 参考素材位于 `/Users/casper/Documents/self/ConstructMarket/docs/pencil`
- 用户明确说明：`mind` 图为主，其它素材只做参考

## Confirmed Scope from Mind Map
- 首页设计
  - 搜索功能
  - 轮播图/装修图
  - 商品分类导航
  - 活动商品推荐
  - 热门商品推荐
- 建材资讯
  - 行业新闻
  - 产品知识
  - 装修指南
- 购物车
  - 商品添加/删除
  - 数量修改
  - 结算入口
- 我的（个人中心）
  - 订单管理
  - 发票开具
    - 电子发票
    - 纸质发票
    - 发票管理
  - 收货地址
  - 收藏夹
  - 优惠券
  - 个人信息
- 客服系统
  - 在线咨询
  - 常见问题
  - 投诉建议
- 支付系统
  - 微信支付
  - 支付宝支付
  - 银联支付

## Findings from Reference Screens / pen
- 参考稿覆盖了首页、分类/选型、搜索结果、商品详情、购物车、结算、支付结果、订单、我的、资讯、发票、地址、收藏、优惠券、个人信息、售后等页面
- 搜索结果页存在两个重要交互：查看更多类目抽屉、筛选侧栏抽屉
- 商品详情页已有清晰的底部操作区：客服、加入购物车、立即购买
- 结算页与支付结果页可支撑完整交易闭环
- 我的页参考稿里有“消息中心/订单审批/我的清单”等能力，但脑图未要求，PRD 不应作为硬需求写入

## Product Positioning Assumptions
- 默认面向工程采购/企业采购用户
- 默认采用微信原生小程序
- 所有列表、详情、状态流转、支付结果都先用 Mock 数据模拟
- 不写后端接口、后台管理、实时推送、审批流

## Follow-up Findings: PRD 落地分析
- 当前仓库没有 `package.json`、锁文件、`tsconfig`、构建配置或 `miniprogram-ci` 配置，说明尚未进入工程实现阶段
- 当前分支为 `main`，工作区干净，适合从“初始化工程基座”开始推进
- PRD 路由清单共 22 个页面能力，其中 4 个 TabBar 页面、18 个二级业务页，适合按“基础设施/交易域/内容域/个人中心与服务域”拆分
- 并行开发的前提不是页面数量，而是先冻结共用约束：设计 token、路由规范、Mock 数据模型、全局 store、基础组件封装方式
- 组件库不应承载业务心智，商品卡片、订单卡片、地址卡片、发票卡片、客服会话等业务组件仍应自建
- 外部资料初步核验显示：`TDesign Miniprogram` 提供小程序组件库与零售模板；`NutUI React` 明确面向 React/Taro 多端；因此若坚持微信原生小程序，NutUI 不是优先路线

## Follow-up Findings: 项目私有 Skills
- 已在仓库内新增 3 个项目私有 skill：`constructmarket-domain`、`wechat-miniapp-engineering`、`constructmarket-qa`
- 这 3 个 skill 选择落库到项目 `skills/` 目录，而不是只保存在本机 `$CODEX_HOME/skills`，目的是支持换设备后的快速恢复
- 已新增 `docs/skills-setup.md` 记录技能用途和安装方法
- 已新增 `scripts/install_project_skills.sh`，支持将项目内 skills 复制安装到 `${CODEX_HOME:-$HOME/.codex}/skills`
- `skill-creator` 自带初始化脚本在当前环境缺少 `PyYAML` 依赖，因此改为手工生成最小可用 skill 结构

## Follow-up Findings: 微信小程序脚手架
- 已新增原生微信小程序工程骨架：`package.json`、`tsconfig.json`、`project.config.json`、`sitemap.json`、`miniprogram/`
- `app.json` 已按 PRD 建立 4 个 TabBar 主包页面和 5 个业务分包
- 已建立 `constants/routes.ts`、`types/`、`mock/`、`store/`，作为后续并行开发的共享边界
- 已创建自定义 `custom-tab-bar`，避免在当前阶段引入图标资源阻塞
- 已用 `npm install --cache ./.npm-cache` 规避本机全局 npm cache 权限问题
- `npm run typecheck` 已通过，说明当前 scaffold 在静态类型层面自洽

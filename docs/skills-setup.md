# ConstructMarket Skills Setup

这份文档记录 ConstructMarket 项目自带的 3 个自定义 skills，方便在新电脑或新环境恢复同一套 Codex 工作流。

## Skills 清单

1. `constructmarket-domain`
   - 作用：约束业务域、PRD 范围、页面边界、实体与状态模型
   - 路径：`skills/constructmarket-domain`
2. `wechat-miniapp-engineering`
   - 作用：约束微信原生小程序的工程结构、分包策略、组件边界和 Mock 驱动开发方式
   - 路径：`skills/wechat-miniapp-engineering`
3. `constructmarket-qa`
   - 作用：约束 PRD 验收、回归测试、边界态检查和代码 review 关注点
   - 路径：`skills/constructmarket-qa`

## 什么时候用

- 做需求映射、业务建模、任务拆分时，用 `constructmarket-domain`
- 做脚手架、目录结构、路由分包、基础组件、页面开发时，用 `wechat-miniapp-engineering`
- 做联调、测试、验收、review、回归检查时，用 `constructmarket-qa`

## 新设备安装

前提：先把本仓库克隆到本地。

### 一键安装

在仓库根目录执行：

```bash
./scripts/install_project_skills.sh
```

如果需要覆盖本机已有的同名 skill：

```bash
./scripts/install_project_skills.sh --force
```

安装完成后，重启 Codex 让新 skills 生效。

### 手动安装

如果不想运行脚本，也可以手动复制：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R skills/constructmarket-domain "${CODEX_HOME:-$HOME/.codex}/skills/constructmarket-domain"
cp -R skills/wechat-miniapp-engineering "${CODEX_HOME:-$HOME/.codex}/skills/wechat-miniapp-engineering"
cp -R skills/constructmarket-qa "${CODEX_HOME:-$HOME/.codex}/skills/constructmarket-qa"
```

## 使用建议

- 这 3 个 skill 是项目私有规范，不是通用公开 skill
- 换设备时，优先先装这 3 个，再开始脚手架或页面开发
- 如果 PRD 大改，记得同步更新对应 skill 内容

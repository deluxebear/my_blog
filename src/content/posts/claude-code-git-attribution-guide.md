---
title: "Claude Code Git Attribution 管理指南：关闭提交署名并清理历史记录"
description: "介绍如何关闭 Claude Code 默认附加在 commit 和 PR 中的署名信息，以及如何清理本地或远程仓库里已有的历史提交。"
pubDate: 2026-03-13
tags: ["Claude Code", "Git", "开发工具", "提交规范", "版本控制"]
featured: false
image: "/post_imgs/claude-code-git-attribution-guide.svg"
---

# Claude Code Git Attribution 管理指南：关闭提交署名并清理历史记录

使用 Claude Code 提交代码时，默认会在 commit message 中附加 Claude 的署名信息。本文介绍如何关闭这一行为，以及如何清理已有的历史提交。

## 问题背景

Claude Code 默认会在每次 `git commit` 时自动附加以下内容：

```text
🤖 Generated with Claude Code

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

这在团队协作或对外开源项目中，有时并不符合提交规范，也可能和团队既有的 Git 提交约定冲突。

## 为什么你可能想关闭它？

常见原因包括：

- 团队要求 commit message 保持统一格式
- 开源项目不希望自动附加第三方署名
- 希望 PR 描述保持简洁
- 需要避免批量历史提交中混入额外 attribution 信息

如果你正好有这些诉求，那么可以直接通过配置关闭默认署名。

## 一、禁止新提交带 Claude 署名

编辑全局配置文件 `~/.claude/settings.json`，将 `commit` 和 `pr` 设为空字符串：

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

### 配置说明

| 字段 | 说明 |
| --- | --- |
| `commit` | 控制 `git commit message` 中的署名内容 |
| `pr` | 控制 Pull Request 描述中的署名内容 |

设为空字符串即完全禁用，**重启 Claude Code 后生效**。

> 注意：`attribution` 配置优先级高于旧版的 `includeCoAuthoredBy`，推荐优先使用新配置。

## 二、清理已有历史提交

如果仓库里已经存在 Claude 自动附加的署名，可以根据不同情况选择处理方式。

### 情况一：只有本地提交，尚未 push

可以使用 `git filter-repo` 批量删除所有 commit 中的 Claude 署名行。

#### 第一步：安装工具

```bash
brew install git-filter-repo
# 或
pip install git-filter-repo --break-system-packages
```

#### 第二步：执行清理

```bash
git filter-repo --force --message-callback '
return re.sub(b".*Co-Authored-By: Claude.*\\n", b"", message)
'
```

`--force` 参数用于跳过 “fresh clone” 检查，在本地仓库直接操作时通常需要加上。

### 情况二：已经 push 到远程

如果这些提交已经推送到远程仓库，那么在执行上述清理命令后，还需要强制推送：

```bash
git push --force
```

#### 注意事项

- 强制推送会改写远程历史，**所有协作者都需要重新 clone 或执行 rebase**
- 公开仓库中这样做的影响较大，建议先评估风险
- 所有相关 commit hash 都会发生变化

### 情况三：只修改最近一次提交

如果你只需要修改最近一条、且尚未 push 的 commit，可以直接执行：

```bash
git commit --amend
```

然后在编辑器中手动删除 `Co-Authored-By` 那一行，保存退出即可。

## 三、按项目单独配置

除了全局配置，也可以按项目分别控制 Claude Code 的 attribution 行为。

| 配置文件路径 | 作用范围 |
| --- | --- |
| `~/.claude/settings.json` | 全局，影响所有项目 |
| `.claude/settings.json` | 项目级，可提交到版本控制与团队共享 |
| `.claude/settings.local.json` | 本地覆盖，通常加入 `.gitignore` |

如果你希望团队统一行为，项目级配置通常更合适；如果只是个人偏好调整，那么全局配置就足够了。

## 实践建议

如果你只是想从现在开始不再附加 Claude 署名，最简单的做法是：

1. 修改 `~/.claude/settings.json`
2. 将 `attribution.commit` 和 `attribution.pr` 设为空字符串
3. 重启 Claude Code

如果你还需要清理旧提交，再根据是否已经推送来决定是否使用 `git filter-repo` 和 `git push --force`。

## 参考

- [Claude Code 官方文档 - Settings](https://code.claude.com/docs/en/settings)

## 总结

Claude Code 默认附加 Git Attribution，本质上是一个可以配置的行为。对于希望保持提交记录简洁、符合团队规范或避免额外署名信息的开发者来说，最稳妥的方案是：**提前关闭 attribution 配置，并谨慎处理已有历史记录。**

如果是新仓库或仅本地提交，清理成本较低；如果已经推送到远程，务必先评估改写历史带来的协作影响，再决定是否执行强推。

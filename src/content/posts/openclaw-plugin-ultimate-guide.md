---
title: "OpenClaw Plugin 最详细的终极指南：什么时候该写 Skill、Tool，什么时候该上 Plugin？"
description: "一篇把 OpenClaw 里的 Skill、Tool、Plugin 边界讲透的完整指南，包含使用现成插件、从零开发插件、Hook、Channel、Provider Auth、Slot、排错与最佳实践。"
pubDate: 2026-03-11
tags: ["OpenClaw", "Plugin", "Skill", "Tool", "AI Agent", "开发指南"]
featured: true
---

# OpenClaw Plugin 最详细的终极指南：什么时候该写 Skill、Tool，什么时候该上 Plugin？

如果你已经开始认真使用 OpenClaw，迟早会碰到一个分水岭问题：

**我到底该写 Skill、加 Tool，还是直接做一个 Plugin？**

很多人一开始会把 Plugin 理解成“更高级一点的 Tool”。但这其实不对。

**Plugin 不是某个功能点的增强版，而是一整套系统级扩展机制。**

它能做的事情，远远不只是“多一个能力”这么简单。一个 Plugin 可以：

- 给 Agent 注册新工具
- 给 OpenClaw 增加新的消息渠道
- 给模型接 OAuth / API Key 登录
- 在生命周期关键节点自动执行逻辑
- 启动后台服务
- 暴露 HTTP 路由或 Gateway RPC
- 甚至接管默认的 memory / contextEngine

所以，这篇文章不只是解释“Plugin 是什么”，更重要的是讲清楚两件事：

1. **怎么使用一个现成的 Plugin**
2. **怎么从零开发一个 Plugin**

我会尽量把它写成一篇真正“能看懂、能上手、能少踩坑”的指南：小白能读明白，刚入门的开发者也能照着开始做。

## 一、先把三种扩展方式讲清楚：Skill、Tool、Plugin

想理解 Plugin，第一步不是看 API，而是先把这三种扩展方式的边界分清。

### 1. Skill：教 AI 怎么做

Skill 更像一份操作手册，或者一套可复用的 SOP。

它解决的问题通常是：

- 遇到某类任务时应该怎么做
- 要遵循什么风格、规则和流程
- 某个领域有哪些背景知识需要补充

Skill 的本质是：**给模型额外的规则和上下文。**

它不会直接给系统增加新的代码能力。

适合 Skill 的场景通常包括：

- 写作规范
- 调研流程
- 内容风格约束
- 某个领域知识补充

一句话总结：**Skill 负责“教它怎么做”。**

### 2. Tool：给 AI 一个动作

Tool 是一个可调用的功能单元，你可以把它理解成“AI 能用的函数”。

比如：

- 搜索网页
- 读文件
- 发消息
- 查询数据库
- 生成图片

Tool 的特点通常很明确：

- 有输入参数
- 做一个确定动作
- 返回一个确定结果

它解决的是“会不会做”的问题，而不是“应不应该做”或“系统何时自动介入”的问题。

但 Tool 通常是**被动的**。
也就是说，它得等 Agent 决定要调用它，它才会执行。

一句话总结：**Tool 负责“给它一个动作”。**

### 3. Plugin：扩展系统本身

Plugin 的级别比 Tool 更高一层。

它不是一个动作，也不是一份规则，而是**系统级扩展机制**。

一个 Plugin 可以：

- 注册 Tool
- 注册 Hook
- 注册 CLI 命令
- 注册 HTTP 路由
- 注册消息渠道
- 注册 Provider 登录
- 注册后台服务
- 注册 Context Engine
- 接管某个 Slot，比如 `memory` 或 `contextEngine`

所以更准确的理解应该是：

- **Skill 是“教它怎么做”**
- **Tool 是“给它一个动作”**
- **Plugin 是“给整个系统增加能力，并控制系统流程”**

这三者不是同一层面的东西。很多人会用错，不是因为不会写，而是因为一开始就把边界搞混了。

## 二、什么时候该用 Plugin，而不是 Skill 或 Tool？

这个判断非常关键。很多设计一开始就走偏，不是能力不够，而是扩展方式选错了。

### 适合 Skill 的情况

如果你的需求主要是：

- 给 AI 增加规则
- 限制行为
- 补充知识
- 规范回答方式

那大概率 **Skill 就够了**。

你不需要改系统，也不需要新增接口，只是希望 Agent 在某类任务中更稳、更像你想要的风格，那优先考虑 Skill。

### 适合 Tool 的情况

如果你的需求是：

- 增加一个明确功能
- 输入参数 → 执行 → 返回结果
- 不需要系统级接入，只需要 Agent 可调用

那通常 **Tool 更合适**。

比如“查一下数据库”“帮我发条消息”“读某个文件内容”，这类场景本质上都是动作，不是系统扩展。

### 必须上 Plugin 的情况

以下这些需求，通常就该直接考虑 Plugin 了。

#### 1）你想让某件事自动发生

比如：

- 每次 prompt 构建前自动注入内容
- 每次工具调用前自动审计参数
- 每次消息发送前自动修改格式
- 每次会话开始时自动初始化资源

这类需求用 Tool 很别扭，因为 Tool 必须等 Agent 主动调用。
但 Plugin 可以通过 Hook 在生命周期关键节点**主动介入**。

这就是两者最根本的区别之一。

#### 2）你想接入一个新的消息渠道

比如你想支持一个新的聊天平台、企业 IM，或者自建消息系统。

这不是简单的“发消息”功能，而是要完整接入 OpenClaw 的 channel 体系，包括：

- 账号配置
- 收发逻辑
- 状态管理
- 可能还有 onboarding 流程

这类就是典型的 **channel plugin**。

#### 3）你想给模型做登录授权

比如：

- OAuth
- API Key
- Device Code

这类能力属于 **provider auth plugin**，因为它不是某次调用时临时传个参数，而是要把“登录能力”正式接进系统。

#### 4）你想替换默认系统能力

比如：

- 替换默认记忆系统
- 自定义上下文引擎

这时你面对的不是普通扩展，而是系统里的 **Slot**。这种情况本质上是“接管模块”，而不是“新增功能”。

#### 5）你想给 OpenClaw 增加新的系统入口

例如：

- 新 CLI 命令
- 新 HTTP 路由
- 新 Gateway RPC 方法
- 后台服务

这些都已经超出了 Skill 或 Tool 的覆盖范围，必须进入 Plugin 的世界。

## 三、OpenClaw Plugin 到底能做什么？

按官方文档，插件可以注册这些能力：

- **Gateway RPC methods**
- **Gateway HTTP routes**
- **Agent tools**
- **CLI commands**
- **Background services**
- **Context engines**
- **Skills**
- **Auto-reply commands**
- **Provider auth**
- **Messaging channels**

这说明 Plugin 不是一个“边缘功能”，而是 OpenClaw 官方正式定义的系统扩展单元。

你完全可以把它理解成：

**OpenClaw 允许你把自己的系统能力正式接进来，而不是只能修改核心代码。**

这件事很重要，因为它意味着 OpenClaw 的扩展不是靠“魔改源码”完成的，而是通过一套工程化的插件机制完成的。

## 四、Plugin 的几个关键概念：开发时一定会遇到

### 1. Manifest

每个 Plugin 都必须有一个 `openclaw.plugin.json`。

这是插件的清单文件，用来描述：

- 插件身份（`id`、`name`、`description`）
- 配置 Schema
- UI hints（可选）
- 插件发现与校验所需的元信息

它的重要性在于：

**OpenClaw 的配置校验不会执行插件代码，而是依赖 manifest 和 JSON Schema。**

这意味着三件事：

- 更安全
- 更容易做配置校验
- 更适合在 UI 里自动生成配置表单

### 2. Plugin Entry

插件本体通常是一个 TypeScript 入口文件，比如 `index.ts`。

OpenClaw 会在运行时加载它。

插件入口既可以导出一个对象，也可以导出一个函数。

最小骨架大概是这样：

```ts
export default {
  id: "my-plugin",
  register(api) {
    api.logger.info("plugin loaded");
  },
};
```

或者这样：

```ts
export default function (api) {
  api.logger.info("plugin loaded");
}
```

最小插件其实非常简单。真正的复杂度，不在“让它加载起来”，而在“你接下来让它接管什么能力”。

### 3. `plugins.entries.<id>.config`

这是普通插件自己的配置空间。

比如：

```json
{
  "plugins": {
    "entries": {
      "my-plugin": {
        "enabled": true,
        "config": {
          "apiKey": "${MY_API_KEY}",
          "region": "us-east-1"
        }
      }
    }
  }
}
```

这里有几个重点：

- 普通插件配置放在 `plugins.entries.<id>.config`
- 支持环境变量，如 `${ENV_VAR}`
- 配置会按 manifest 里的 Schema 校验

这也是为什么 manifest 不能乱写，因为它直接决定配置体验和校验能力。

### 4. Slots

这是很多人前期容易忽略、后期一定会踩到的点。

有些插件不是“并排增加一个能力”，而是要**独占接管某个系统模块**。

目前官方文档里明确提到的 slot 有两个：

- `memory`
- `contextEngine`

配置大概像这样：

```json
{
  "plugins": {
    "slots": {
      "memory": "memory-core",
      "contextEngine": "legacy"
    }
  }
}
```

也可以写成：

```json
{
  "plugins": {
    "slots": {
      "memory": "none"
    }
  }
}
```

表示关闭该 slot。

这里最关键的一点是：

**同一个 slot，同时只能由一个插件接管。**

所以如果你开发的是 memory plugin 或 context engine plugin，本质上不是“再加一个”，而是“替换当前 owner”。

## 五、如何使用一个现成的 Plugin？

在讲开发前，先讲使用。因为只有理解用户是怎么接入插件的，你开发时才知道该提供什么体验。

### 第一步：查看当前插件

```bash
openclaw plugins list
```

先看系统里已经有哪些插件。

### 第二步：安装插件

安装 npm 插件：

```bash
openclaw plugins install <npm-spec>
```

安装本地插件：

```bash
openclaw plugins install ./extensions/my-plugin
```

开发调试时 link 本地插件：

```bash
openclaw plugins install -l ./extensions/my-plugin
```

根据官方文档：

- npm spec 只接受 registry-only
- 可以用包名、精确版本、dist-tag
- 不接受 Git / URL / file spec / semver range

这点很多人容易忽略。

### 第三步：启用插件

```bash
openclaw plugins enable <id>
```

要特别注意：

**安装成功，不等于插件已经可用。**

安装只是把它放进系统里，启用才表示 OpenClaw 会真正加载和使用它。

### 第四步：配置插件

普通插件一般写在：

`plugins.entries.<id>.config`

例如：

```json
{
  "plugins": {
    "entries": {
      "voice-call": {
        "enabled": true,
        "config": {
          "provider": "twilio"
        }
      }
    }
  }
}
```

### 第五步：重启 Gateway

```bash
openclaw gateway restart
```

这一步非常重要。官方文档明确说明：

**配置变更需要重启 Gateway 才会生效。**

很多“为什么配置了还是没反应”的问题，根因就是这里。

### 第六步：验证与诊断

```bash
openclaw plugins info <id>
openclaw plugins doctor
openclaw config validate
```

这三条命令基本能覆盖大部分常见问题。

## 六、开发一个 Plugin，目录结构该怎么搭？

一个常见的插件目录，大概是这样：

```bash
my-plugin/
├── package.json
├── openclaw.plugin.json
├── index.ts
└── ...
```

### `package.json`

主要负责：

- npm 包信息
- 依赖管理
- 声明 `openclaw.extensions`

例如：

```json
{
  "name": "my-plugin",
  "openclaw": {
    "extensions": ["./index.ts"]
  }
}
```

如果一个包里声明多个 extension entry，OpenClaw 会按规则派生 plugin id。

### `openclaw.plugin.json`

这是插件 manifest。通常至少要包含：

- `id`
- `name`
- `description`
- `configSchema`
- `uiHints`（可选）

例如：

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "description": "Does something useful",
  "configSchema": {
    "type": "object",
    "properties": {
      "apiKey": { "type": "string" },
      "region": { "type": "string" }
    }
  },
  "uiHints": {
    "apiKey": { "label": "API Key", "sensitive": true },
    "region": { "label": "Region" }
  }
}
```

### `index.ts`

这是插件真正的逻辑入口。

通常你会在这里做这些事：

- 注册 Tool
- 注册 Hook
- 注册 Provider
- 注册 Channel
- 注册 Service
- 注册 CLI / Command / Route

## 七、从零开发：最小可用 Plugin

如果你是第一次写 OpenClaw Plugin，不要一上来就挑战最复杂的类型。

最稳的学习路径应该是：

**先做最小插件 → 再注册一个 Tool → 再加 Hook → 最后再挑战更重的系统能力。**

### 第一步：先做最小骨架

```ts
export default {
  id: "my-plugin",
  register(api) {
    api.logger.info("my-plugin loaded");
  },
};
```

只要它能被系统加载，你就已经打通了最基础的一步。

### 第二步：注册一个最简单的 Tool

这是最适合入门的下一步，因为它既能让你理解插件 API，又不会马上陷入系统复杂度。

一个最小示例大概如下：

```ts
export default function (api) {
  api.registerTool(
    {
      name: "say_hello",
      label: "Say Hello",
      description: "Greet the user",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" }
        },
        required: ["name"]
      },
      async execute(_toolCallId, params) {
        return {
          content: [
            { type: "text", text: `Hello, ${params.name}!` }
          ]
        };
      }
    },
    { name: "say_hello" }
  );
}
```

这个例子的重点不在功能，而在于帮助你理解三件事：

- 插件可以注册 Tool
- Tool 只是插件能力的一部分
- 你可以逐步把自己的系统能力接进 OpenClaw

## 八、Hook 怎么开发？为什么它是 Plugin 的真正分水岭？

如果说注册 Tool 只是“让系统多一个可调用功能”，那 Hook 才是真正体现 Plugin 价值的地方。

因为 Hook 意味着：

**你不是在等 Agent 来调用你，而是在系统关键生命周期里主动介入。**

这就是 Plugin 和普通 Tool 最大的区别之一。

### 1）`api.registerHook(...)`

文档示例大致如下：

```ts
export default function register(api) {
  api.registerHook(
    "command:new",
    async () => {
      // Hook logic here.
    },
    {
      name: "my-plugin.command-new",
      description: "Runs when /new is invoked",
    },
  );
}
```

这类 hook 会出现在 `openclaw hooks list` 中，显示为 `plugin:<id>`。

不过要注意：
它们不能通过 hooks CLI 单独启停，通常要通过启停插件来控制。

### 2）`api.on(...)`：生命周期 Hook

官方也推荐用 `api.on(...)` 来做 typed lifecycle hooks。

例如：

```ts
export default function register(api) {
  api.on("before_prompt_build", () => {
    return {
      prependSystemContext: "Follow company style guide.",
    };
  });
}
```

几个最关键的生命周期节点包括：

#### `before_model_resolve`

- 发生在模型选择前
- 适合做 `modelOverride` / `providerOverride`

#### `before_prompt_build`

- 发生在 prompt 构建前
- 适合注入上下文、修改 prompt 结构
- 可以返回：
  - `prependContext`
  - `systemPrompt`
  - `prependSystemContext`
  - `appendSystemContext`

#### `before_agent_start`

- 官方明确标记为 **legacy compatibility hook**
- 一般更推荐优先使用前两个更明确的 Hook

### 3）Prompt 注入不是无限制的

官方文档特别提到，运营者可以限制插件的 prompt 注入能力，例如：

```json
{
  "plugins": {
    "entries": {
      "some-plugin": {
        "hooks": {
          "allowPromptInjection": false
        }
      }
    }
  }
}
```

这件事说明一个现实：

**Hook 很强，但强能力一定伴随更高的安全要求。**

所以你在设计 prompt 相关 Hook 时，不应该只考虑“技术上能不能做”，还要考虑“系统是否允许这样做”。

## 九、Provider Auth Plugin 怎么开发？

这是很多人第一次看文档时容易跳过，但其实相当高级、也很实用的一类插件。

它的作用是：
**把模型供应商的登录能力正式接进 OpenClaw。**

比如：

- OAuth
- API Key
- Device Code

核心接口是：

`api.registerProvider(...)`

官方示意大概类似这样：

```ts
api.registerProvider({
  id: "acme",
  label: "AcmeAI",
  auth: [
    {
      id: "oauth",
      label: "OAuth",
      kind: "oauth",
      run: async () => {
        return {
          profiles: [
            {
              profileId: "acme:default",
              credential: {
                type: "oauth",
                provider: "acme",
                access: "...",
                refresh: "...",
                expires: Date.now() + 3600 * 1000,
              },
            },
          ],
          defaultModel: "acme/opus-1",
        };
      },
    },
  ],
});
```

用户侧就可以这样使用：

```bash
openclaw models auth login --provider acme --method oauth
```

如果你以后要做自定义 provider 集成，这部分就是主战场。

## 十、Channel Plugin 怎么开发？

如果你想让 OpenClaw 接入一个新的聊天平台，那就不是普通 Tool 了，而是要写 **channel plugin**。

官方给出的最小示例大致如下：

```ts
const myChannel = {
  id: "acmechat",
  meta: {
    id: "acmechat",
    label: "AcmeChat",
    selectionLabel: "AcmeChat (API)",
    docsPath: "/channels/acmechat",
    blurb: "demo channel plugin.",
    aliases: ["acme"],
  },
  capabilities: { chatTypes: ["direct"] },
  config: {
    listAccountIds: (cfg) => Object.keys(cfg.channels?.acmechat?.accounts ?? {}),
    resolveAccount: (cfg, accountId) =>
      cfg.channels?.acmechat?.accounts?.[accountId ?? "default"] ?? {
        accountId,
      },
  },
  outbound: {
    deliveryMode: "direct",
    sendText: async () => ({ ok: true }),
  },
};

export default function (api) {
  api.registerChannel({ plugin: myChannel });
}
```

你不需要一开始就把所有字段背下来，但至少要先理解三件事。

### 1）Channel 配置不放在 `plugins.entries`

它放在：

`channels.<id>`

例如：

```json
{
  "channels": {
    "acmechat": {
      "accounts": {
        "default": {
          "token": "ACME_TOKEN",
          "enabled": true
        }
      }
    }
  }
}
```

### 2）最基础至少要实现什么

一般最基础要包括：

- `config.listAccountIds`
- `config.resolveAccount`
- `outbound.sendText`

### 3）它还能继续扩展什么

文档里还提到，channel plugin 还可以扩展：

- onboarding
- security
- status
- gateway
- mentions
- threading
- streaming
- actions
- commands

这意味着 channel plugin 的上限很高，但初学时千万别想着一步做到满配。

## 十一、插件还能注册哪些系统入口？

除了 Tool、Hook、Provider、Channel，Plugin 还可以注册很多“系统入口”。

### 1）CLI 命令

```ts
export default function (api) {
  api.registerCli(
    ({ program }) => {
      program.command("mycmd").action(() => {
        console.log("Hello");
      });
    },
    { commands: ["mycmd"] },
  );
}
```

用户就能运行：

```bash
openclaw mycmd
```

### 2）Auto-reply Commands

这类命令很实用，因为它是：

**不经过 AI agent，直接执行。**

例如：

```ts
api.registerCommand({
  name: "mystatus",
  description: "Show plugin status",
  handler: () => ({ text: "Plugin is running!" }),
});
```

特别适合做：

- 状态查询
- 快速切换
- 简单控制命令

### 3）HTTP Routes

```ts
api.registerHttpRoute({
  path: "/acme/webhook",
  auth: "plugin",
  match: "exact",
  handler: async (_req, res) => {
    res.statusCode = 200;
    res.end("ok");
    return true;
  },
});
```

适合用来接：

- webhook
- 第三方回调
- 对外接入点

### 4）Gateway RPC Methods

```ts
api.registerGatewayMethod("myplugin.status", ({ respond }) => {
  respond(true, { ok: true });
});
```

适合用来做：

- 系统内方法暴露
- 状态查询
- 内部控制接口

### 5）Background Services

```ts
export default function (api) {
  api.registerService({
    id: "my-service",
    start: () => api.logger.info("ready"),
    stop: () => api.logger.info("bye"),
  });
}
```

适合处理：

- 持久连接
- 后台轮询
- 插件级资源管理

## 十二、Plugin 的发现、加载与优先级

这一节概念不复杂，但非常容易导致“明明改了代码却不生效”的错觉。

OpenClaw 会按顺序扫描插件来源：

1. `plugins.load.paths`
2. 工作区 `.openclaw/extensions/`
3. 全局目录 `~/.openclaw/extensions/`
4. bundled extensions

如果多个插件的 id 相同：

**优先级更高的来源会生效，后面的会被忽略。**

所以当你发现自己明明改了插件代码、结果运行效果完全没变化时，不一定是代码错了，也可能是系统实际加载的是另一份同 id 插件。

## 十三、开发时最容易踩的坑

很多坑不是“代码不会写”，而是“不懂 OpenClaw 的运行规则”。

### 坑 1：装了插件，但没启用

`install ≠ enable`

安装完以后别忘了：

```bash
openclaw plugins enable <id>
```

### 坑 2：改了配置，但没重启 Gateway

这是最常见的问题之一：

```bash
openclaw gateway restart
```

不重启，很多配置变更根本不会生效。

### 坑 3：把 channel 配置写到 `plugins.entries`

这是典型错误。

- 普通插件配置放在：`plugins.entries.<id>.config`
- channel plugin 配置放在：`channels.<id>`

别混。

### 坑 4：多个同 id 插件冲突

你以为自己加载的是新版本，实际上系统吃的是旧版本。

遇到这种问题，要优先检查：

- plugin source path
- install path
- load precedence

### 坑 5：Slot 插件并存，但没有明确 owner

`memory` 和 `contextEngine` 是独占位。

不是“多装几个看看谁先抢到”，而是必须明确写在：

`plugins.slots`

### 坑 6：把 Plugin 当成低风险小组件

官方已经说得很明确：

**Plugins run in-process with the Gateway. Treat them as trusted code.**

翻译成人话就是：

**插件是高权限代码，不是玩具。**

它不是浏览器扩展那种“随便装一个试试”的东西，接入前必须有基本的信任判断。

### 坑 7：第一次写 Plugin 就挑战最重类型

如果你第一次写 Plugin，就直接去做：

- 自定义 channel
- provider auth
- memory slot
- context engine

大概率会被复杂度直接打懵。

更合理的路径是：

1. 先做最小骨架
2. 再注册一个简单 Tool
3. 再加一个 Hook
4. 最后再挑战 channel / provider / slot 类插件

## 十四、排错时怎么查？给你一条最稳的顺序

当插件出问题时，别急着一头扎进代码里 debug。

更稳的排查顺序是：

### 第一步：插件存在吗？

```bash
openclaw plugins list
```

### 第二步：插件状态和详情对吗？

```bash
openclaw plugins info <id>
```

### 第三步：整体诊断通过吗？

```bash
openclaw plugins doctor
```

### 第四步：配置是否合法？

```bash
openclaw config validate
```

### 第五步：是不是忘了重启？

```bash
openclaw gateway restart
```

### 第六步：是不是加载到了错误的同 id 插件？

重点检查：

- `plugins.load.paths`
- workspace extensions
- global extensions
- bundled extensions

这条链路非常实用。很多问题根本不用改代码，顺着这条排查链就能直接定位出来。

## 十五、给初学者的最小开发路线

如果你是第一次开发 OpenClaw Plugin，我建议按下面这条路径走。

### 第一步：写最小插件骨架

目标：先让插件能被系统成功加载。

### 第二步：注册一个最小 Tool

目标：理解插件 API，以及 agent tool 的基本接入方式。

### 第三步：加一个简单 Hook

目标：理解“主动介入生命周期”和“被动等待调用”的区别。

### 第四步：补 Manifest Schema 和 UI Hints

目标：让插件配置更像正式产品，而不是“自己能跑就算完成”。

### 第五步：再挑战更重的 Plugin 类型

比如：

- provider auth plugin
- channel plugin
- memory plugin
- context engine plugin

这条路线背后的核心思想其实很简单：

**先学会 Plugin 机制，再去挑战系统级复杂度。**

不要第一天就去打 boss。

## 十六、最后收口：这篇文章真正要记住什么？

如果你读完后只记住 5 件事，这篇文章就没白看。

### 1）Plugin 不等于 Tool 的升级版

它是系统级扩展机制，不是单个动作的增强版。

### 2）一定要先分清 Skill / Tool / Plugin 的边界

不然你会一直用错扩展方式，越做越别扭。

### 3）Plugin 的核心价值在“系统接入”和“生命周期控制”

这才是它和普通 Tool 的本质差别。

### 4）开发时先从最小骨架、最小 Tool 开始

别一上来就挑战最重的类型。

### 5）配置、加载、重启、优先级，往往比代码更容易踩坑

不要低估这些工程细节。

## 十七、常用命令速查

```bash
# 查看插件
openclaw plugins list

# 查看插件详情
openclaw plugins info <id>

# 安装插件（npm / 本地 / link）
openclaw plugins install <npm-spec>
openclaw plugins install ./local-plugin
openclaw plugins install -l ./local-plugin

# 启用 / 禁用
openclaw plugins enable <id>
openclaw plugins disable <id>

# 更新插件
openclaw plugins update <id>
openclaw plugins update --all

# 插件诊断
openclaw plugins doctor

# 模型认证插件登录
openclaw models auth login --provider <id> [--method <id>]

# 校验配置
openclaw config validate

# 重启 Gateway
openclaw gateway restart
```

## 结语

对小白来说，Plugin 一开始看起来像是一个很重、很工程化的概念。
对开发者来说，它又很容易被误解成“无非就是多写点代码”。

这两种理解都不完整。

更准确地说，OpenClaw Plugin 是一种系统化扩展机制：
它让你在不修改核心代码的前提下，把自己的能力、流程、入口和系统集成正式接进 OpenClaw。

所以它不只是一个“扩展点”，而是 OpenClaw 能够真正走向工程化、产品化、系统化扩展的关键机制。

如果你接下来只准备迈出第一步，我的建议很简单：

**先做一个最小插件骨架。先让它成功加载，再让它注册一个 Tool。**

当你做到这一步时，你就已经真正进入 OpenClaw Plugin 的世界了。

# UI 优化设计方案：复古工业风精致化

日期：2026-07-11
状态：已确认
范围：仅视觉/样式层改动，不改变任何网站内容、页面结构与功能。

## 背景

「数得其道」是基于 Astro 的中文个人博客，现有设计为复古工业风（牛皮纸色系 + 打字机美学）。方向已确认：**保留复古风格并做精致化打磨**，不做风格重设计。

现状主要问题：

1. 正文/标题字体为 Courier Prime / JetBrains Mono（英文等宽字体），不覆盖中文，中文全部回退系统字体，中英文混排割裂；中文上的 `letter-spacing` 与 `text-transform: uppercase` 无效或不协调。
2. body 与 header 叠加 4~8 层噪点/点阵/对角线纹理背景，另有 60 秒 header 纹理动画与 `backdrop-filter: blur(0.3px)`，视觉噪音大且耗渲染性能。
3. `--color-muted`（#a0906c）在米色背景上对比度约 1.9:1，不达 WCAG AA。
4. 导航激活态同时使用四重指示（顶部圆点、底部横条、背景反色、上浮位移），过度设计。
5. 文章阅读页正文栏宽 1000px，中文每行远超适读字数；行高 1.6 偏紧。

## 设计决策

### 1. 字体系统

- 中文正文与标题：**霞鹜文楷屏幕阅读版**（`lxgw-wenkai-screen-webfont`），经 jsDelivr CDN 引入，按 unicode-range 分包、浏览器按需加载子集。
- 英文、代码、日期、标签：保留 **JetBrains Mono**；移除 Courier Prime 的加载与引用。
- 字体栈：
  - `--font-sans: "LXGW WenKai Screen", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
  - `--font-mono: "JetBrains Mono", "LXGW WenKai Screen", monospace`
- 含中文的标题、导航、按钮去掉 `letter-spacing` 与 `text-transform: uppercase`；纯英文装饰性小标签（如 hero 的 "DIGITAL GARDEN"）保留原样式。

### 2. 配色与对比度

牛皮纸色系（bg #d4c4a0 / card #e8dcc0 / accent #8b4513）保持不变，仅修正对比度：

- 浅色模式 `--color-muted`：#a0906c → 加深至在 #d4c4a0 背景上 ≥ 4.5:1（约 #6b5a3d 一档，实施时以对比度计算为准）。
- 深色模式 `--color-muted`：#8b7355 → 提亮至在其实际渲染表面（页面底 #2c2416、卡片 #3a3020、代码底 #4a3f2a）上均 ≥ 4.5:1。
- 其余色板变量不动。

### 3. 背景纹理简化

- body、header 仅保留**单层 noise.webp** 低透明度纸张质感，删除全部 radial-gradient 点阵层、linear-gradient 对角线/水平线层及对应的多组 background-size/blend-mode。
- 删除 `.header::before` 纹理动画层与 `@keyframes headerTextureShift`。
- 删除 `backdrop-filter: blur(0.3px)`、`blur(0.5px)` 等无可见效果的属性；header 的 sticky 毛玻璃可保留一个正常强度的 `backdrop-filter`。
- 各断点下为纹理定制的多组 media query background-size 相应删除。

### 4. 导航 Header

- 激活态改为单一指示：**文字变 accent 色 + 底部 2px 短下划线**；删除顶部 ● 圆点、背景反色块与 translateY 位移。
- hover 仅做颜色过渡，无位移、无边框闪现。
- 中文导航项与站点副标题去 uppercase/letter-spacing，导航字号由 0.875rem 略增。
- 相关 `!important` 覆盖随旧激活态样式一并清理。

### 5. 文章卡片（PostCard）

- 标题使用文楷、去 letter-spacing，字重 600–700。
- 日期作为小号 JetBrains Mono meta 行视觉降级（muted 色）。
- 摘要 `-webkit-line-clamp: 3` 截断，保证网格卡片高度整齐。
- 标签保留等宽小字样式，边框减淡（borderColor 用更浅一档或降低不透明度），去 uppercase。
- 保留 hover 上浮 + 阴影加深与图片轻微 scale 效果。

### 6. 文章阅读页

- 正文栏宽 1000px → **720px**（约 38–40 个中文字/行）；右侧 TOC 布局关系保持。
- 正文行高 1.6 → **1.8**，段距相应加大；正文字号 16px → 17px（仅文章正文区域）。
- 标题上下留白按层级拉开（h2 上方留白 > h3 > 段落）。
- 文章大标题（article-title）3rem 视中文观感微调，行高由 1.1 放宽到 ≥ 1.25。

## 改动文件清单

| 文件 | 改动 |
|---|---|
| `src/layouts/Layout.astro` | 字体引入与字体栈、色板变量、纹理简化、全局排版（h1–h6/p/a/blockquote）、按钮 |
| `src/components/Header.astro` | 导航激活态/hover、字体与大小写、site-title 样式 |
| `src/components/PostCard.astro` | 标题/日期/摘要/标签层级重排 |
| `src/pages/posts/[...slug].astro` | 栏宽、行高、段距、标题留白 |
| `src/pages/index.astro` | hero 标题字体适配（中文部分去 uppercase/letter-spacing），section-title 同理 |

## 不做的事

- 不改任何 Markdown 文章内容、页面文案、页面结构与路由。
- 不改工具页、关于页、项目页的页面级样式（它们会自动继承全局层改进）。
- 不替换配色方案，不引入新的 UI 框架或依赖包（字体走 CDN，不进 package.json）。
- 不动搜索、代码高亮、主题切换等功能逻辑。

## 验证方式

1. `npm run build` 通过。
2. `npm run dev` 后用浏览器截图核对：首页、文章列表页、任一文章详情页 × 明/暗两种模式。
3. 核对点：中文渲染为文楷、无布局破损、对比度观感、导航激活态、卡片网格整齐、文章行长适读。

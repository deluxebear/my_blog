# 博客 UI 复古风精致化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变任何内容与功能的前提下，把现有复古工业风打磨精致：中文字体、对比度、纹理降噪、导航/卡片/阅读页排版。

**Architecture:** 纯样式层改动。全局层（字体、色板、纹理）在 `src/layouts/Layout.astro` 的 `is:global` 样式中完成；组件层改各自的 scoped `<style>`。无新增 npm 依赖，字体走 CDN。

**Tech Stack:** Astro 5、原生 CSS（CSS 变量）、LXGW WenKai Screen（jsDelivr CDN）、JetBrains Mono（Google Fonts）。

**设计依据:** `docs/superpowers/specs/2026-07-11-ui-retro-refinement-design.md`

## Global Constraints

- 不修改任何 Markdown 文章内容、页面文案、HTML 结构、路由与 JS 功能逻辑（主题切换、搜索、代码高亮、复制按钮均不动）。
- 不新增 package.json 依赖；字体仅通过 `<link>` 引入 CDN。
- 色板核心色不变：`--color-bg: #d4c4a0`、`--color-card: #e8dcc0`、`--color-accent: #8b4513`（浅色）；深色对应值不变。仅 `--color-muted` 按下方指定值修改。
- 字体栈统一为：
  - `--font-sans: "LXGW WenKai Screen", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;`
  - `--font-mono: "JetBrains Mono", "LXGW WenKai Screen", monospace;`
- 本项目无自动化测试框架，每个任务的验证方式为：`npm run build` 成功 + 该任务指定的视觉检查点；最后有一个全站双模式视觉 QA 任务。
- 纯英文装饰性文本（hero 的 "DIGITAL GARDEN"）保留 uppercase/letter-spacing 风格；所有含中文的文本一律去掉 `text-transform: uppercase` 与 `letter-spacing`。

---

### Task 1: 字体引入与全局排版基础

**Files:**
- Modify: `src/layouts/Layout.astro:50-62`（head 字体链接）
- Modify: `src/layouts/Layout.astro:141-142`（字体变量）
- Modify: `src/layouts/Layout.astro:383-394`（标题排版）
- Modify: `src/layouts/Layout.astro:851-865`（.btn）

**Interfaces:**
- Produces: 全局 CSS 变量 `--font-sans`（文楷栈）与 `--font-mono`（JetBrains Mono 栈），后续所有任务的组件样式依赖这两个变量。

- [ ] **Step 1: 替换 head 中的字体链接**

将 Layout.astro 中这段：

```html
<!-- Preload fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Courier+Prime:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

替换为：

```html
<!-- Preload fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
<!-- 霞鹜文楷屏幕阅读版：按 unicode-range 分包，浏览器按需加载子集 -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.7.0/style.css"
/>
```

- [ ] **Step 2: 更新字体变量**

将 `:root` 中：

```css
--font-mono: "JetBrains Mono", "Courier Prime", monospace;
--font-sans: "Courier Prime", "JetBrains Mono", monospace;
```

替换为：

```css
--font-mono: "JetBrains Mono", "LXGW WenKai Screen", monospace;
--font-sans: "LXGW WenKai Screen", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
```

- [ ] **Step 3: 全局标题改用文楷、去 letter-spacing**

将：

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.5em;
  letter-spacing: 1px;
}
```

替换为：

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-sans);
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 0.5em;
}
```

- [ ] **Step 4: .btn 去 uppercase/letter-spacing、改文楷**

将 `.btn` 规则中的：

```css
font-family: var(--font-mono);
font-weight: 700;
text-transform: uppercase;
letter-spacing: 1px;
```

替换为：

```css
font-family: var(--font-sans);
font-weight: 600;
```

（`.btn` 其余声明不动。）

- [ ] **Step 5: 构建验证**

Run: `npm run build`
Expected: 构建成功无报错。

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "ui: 引入霞鹜文楷字体栈，修正全局中文排版基础"
```

---

### Task 2: 对比度修正

**Files:**
- Modify: `src/layouts/Layout.astro:139`（浅色 `--color-muted`）
- Modify: `src/layouts/Layout.astro:161`（深色 `--color-muted`）

**Interfaces:**
- Produces: 达标的 `--color-muted`，Task 5 的 `.post-date` 会引用它。

- [ ] **Step 1: 修改浅色模式 muted 色**

`:root` 中 `--color-muted: #a0906c;` 改为：

```css
--color-muted: #5f5038; /* 在 #d4c4a0 上 ≈4.5:1，WCAG AA */
```

- [ ] **Step 2: 修改深色模式 muted 色**

`.dark` 中 `--color-muted: #8b7355;` 改为：

```css
--color-muted: #a89272; /* 在 #2c2416 上 ≈5.1:1，WCAG AA */
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "ui: 修正 muted 色对比度至 WCAG AA"
```

---

### Task 3: 背景纹理简化

**Files:**
- Modify: `src/layouts/Layout.astro:175-381`（body/header 纹理、动画、backdrop-filter）
- Modify: `src/layouts/Layout.astro:883-1004`（两处 media query 中的纹理 background-size 块）

**Interfaces:**
- Produces: 全局 `.header` 的半透明纸底 + 毛玻璃背景（`rgba(232,220,192,0.95)` / 深色 `rgba(58,48,32,0.95)`）。Task 4 会删除 Header.astro scoped 样式里的 `background-color` 以让位于此规则。

- [ ] **Step 1: 简化 body 背景为单层噪点**

将 `body { ... }` 与其后的 `.dark body { ... }` 两条规则（含全部多层 background-image/background-size/blend-mode）替换为一条：

```css
body {
  background-color: var(--color-bg);
  /* 单层噪点纹理，纸张质感 */
  background-image: url("/noise.webp");
  background-repeat: repeat;
  background-size: 80px 80px;
  background-blend-mode: soft-light;
  color: var(--color-text);
  line-height: 1.6;
  font-size: 16px;
  min-height: 100vh;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  font-weight: 400;
  overflow-x: hidden;
  position: relative;
}
```

（深色模式无需单独规则：`--color-bg` 变量切换 + soft-light 混合自动适配。）

- [ ] **Step 2: 删除无效 backdrop-filter、简化卡片阴影**

将：

```css
.industrial-border,
.post-card,
.project-card,
.article-content,
.hero-stats,
.code-snippet {
  position: relative;
  backdrop-filter: blur(0.3px);
}

.post-card,
.project-card {
  background-color: var(--color-card);
  box-shadow:
    var(--shadow-md),
    inset 0 0 0 1px rgba(255, 255, 255, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
}

.article-content {
  background-color: var(--color-card);
  box-shadow:
    var(--shadow-sm),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}
```

替换为：

```css
.post-card,
.project-card {
  background-color: var(--color-card);
  box-shadow: var(--shadow-sm);
}

.article-content {
  background-color: var(--color-card);
  box-shadow: var(--shadow-sm);
}
```

- [ ] **Step 3: 简化 header 背景、删除纹理动画**

将 `.header { ... }`、`.dark .header { ... }`、`.header .container { ... }`、`.header::before { ... }`、`.dark .header::before { ... }`、`@keyframes headerTextureShift { ... }` 整段替换为：

```css
.header {
  position: relative;
  background-color: rgba(232, 220, 192, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 2px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.dark .header {
  background-color: rgba(58, 48, 32, 0.95);
}

.header .container {
  position: relative;
  z-index: 2;
}
```

- [ ] **Step 4: 删除交互元素的伪 backdrop-filter**

将：

```css
.search-box,
.tag-filter,
.btn {
  backdrop-filter: blur(0.5px);
  box-shadow:
    var(--shadow-sm),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
```

替换为：

```css
.search-box,
.tag-filter,
.btn {
  box-shadow: var(--shadow-sm);
}
```

- [ ] **Step 5: 清理 media query 中的纹理配置**

- 在 `@media (max-width: 768px)` 块内，删除 `body { background-size: ... }`、`.dark body { ... }`、`.header { background-size: ... }`、`.dark .header { ... }` 四条纹理规则（保留该块内 h1/h2/h3、.container、代码块等其余规则）。
- 整个 `@media (max-width: 480px)` 块只含纹理配置，删除整块。

- [ ] **Step 6: 构建验证**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 7: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "ui: 背景纹理降噪为单层，删除 header 纹理动画与无效 backdrop-filter"
```

---

### Task 4: Header 导航精修

**Files:**
- Modify: `src/components/Header.astro:45-377`（仅 `<style>` 部分，HTML 与 `<script>` 不动）

**Interfaces:**
- Consumes: Task 3 产出的全局 `.header` 半透明背景（本任务删除 scoped 的 `background-color` 让位）。
- Produces: 无（终端组件）。

- [ ] **Step 1: 让 scoped .header 让位于全局背景**

将 scoped 样式中：

```css
.header {
  background-color: var(--color-card);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  width: 100%;
  overflow: hidden; /* 恢复为 hidden */
}
```

替换为：

```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}
```

- [ ] **Step 2: 站点标题与副标题改文楷、去大写与字距**

将：

```css
.site-title {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
}
```

替换为：

```css
.site-title {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}
```

将：

```css
.site-subtitle {
  font-size: 0.75rem;
  color: var(--color-secondary);
  margin: 0;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.2;
}
```

替换为：

```css
.site-subtitle {
  font-size: 0.75rem;
  color: var(--color-secondary);
  margin: 0;
  font-family: var(--font-sans);
  line-height: 1.2;
}
```

- [ ] **Step 3: 重写导航链接的默认/hover/激活态**

将 `.nav-link`、`.nav-link:hover`、`.nav-link.active`、`.nav-link.active:hover`、`.nav-link.active::after`、`.nav-link.active::before`、`.rss-link`、`.rss-link:hover`、`.rss-link.active` 全部规则替换为：

```css
.nav-link {
  font-family: var(--font-sans);
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-decoration: none;
  transition: color 0.2s ease;
  font-size: 0.9375rem;
  white-space: nowrap;
  position: relative;
  color: var(--color-secondary);
}

.nav-link:hover {
  color: var(--color-accent);
  text-decoration: none;
}

/* 激活态：单一指示 —— 文字变色 + 底部 2px 短下划线 */
.nav-link.active {
  color: var(--color-accent);
}

.nav-link.active::after {
  content: "";
  position: absolute;
  bottom: 0.35rem;
  left: 1rem;
  right: 1rem;
  height: 2px;
  background-color: var(--color-accent);
}

.rss-link {
  color: var(--color-accent);
}
```

- [ ] **Step 4: 主题切换按钮去位移**

将 `.theme-toggle:hover` 中的 `transform: translateY(-1px);` 一行删除（保留背景/文字变色）。

- [ ] **Step 5: 清理移动端 media query 中的旧激活态覆盖**

在 `@media (max-width: 768px)` 块内，删除：

```css
/* 移动端当前页面指示器调整 */
.nav-link.active::before {
  top: -6px;
  font-size: 0.6rem;
}

.nav-link.active::after {
  bottom: -1px;
  height: 2px;
}
```

替换为：

```css
.nav-link.active::after {
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.25rem;
}
```

（该块内其余尺寸规则不动；480px 块内 `.site-title` 等保留，无激活态覆盖需处理。）

- [ ] **Step 6: 构建验证**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 7: Commit**

```bash
git add src/components/Header.astro
git commit -m "ui: 导航改为克制的单一激活指示，站点标题适配中文排版"
```

---

### Task 5: 文章卡片精修

**Files:**
- Modify: `src/components/PostCard.astro:56-178`（仅 `<style>` 部分）

**Interfaces:**
- Consumes: Task 1 的 `--font-sans`、Task 2 的 `--color-muted`。

- [ ] **Step 1: 标题改文楷、去字距**

将：

```css
.post-title {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  color: var(--color-text);
  letter-spacing: 1px;
}
```

替换为：

```css
.post-title {
  font-family: var(--font-sans);
  font-size: 1.1875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  color: var(--color-text);
}
```

- [ ] **Step 2: 日期视觉降级为 muted meta 行**

将：

```css
.post-date {
  font-size: 0.75rem;
  color: var(--color-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: var(--font-mono);
  font-weight: 500;
}
```

替换为：

```css
.post-date {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-weight: 500;
}
```

- [ ] **Step 3: 摘要 3 行截断**

在 `.post-description` 规则末尾追加：

```css
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
```

- [ ] **Step 4: 标签边框减淡、去大写**

将：

```css
.tag {
  background-color: var(--color-code-bg);
  color: var(--color-accent);
  padding: 0.25rem 0.5rem;
  border: var(--border-width) var(--border-style) var(--color-border);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

替换为：

```css
.tag {
  background-color: var(--color-code-bg);
  color: var(--color-accent);
  padding: 0.25rem 0.5rem;
  border: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
  font-size: 0.75rem;
  font-family: var(--font-mono);
  font-weight: 500;
}
```

- [ ] **Step 5: 构建验证**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 6: Commit**

```bash
git add src/components/PostCard.astro
git commit -m "ui: 文章卡片层级重排——文楷标题、muted 日期、摘要截断、标签减淡"
```

---

### Task 6: 阅读页与首页标题适配

**Files:**
- Modify: `src/pages/posts/[...slug].astro:111-365`（仅 `<style>` 部分）
- Modify: `src/pages/index.astro:132-410`（仅 `<style>` 部分）

**Interfaces:**
- Consumes: Task 1 的 `--font-sans`。

- [ ] **Step 1: 正文栏宽收窄到 720px**

`[...slug].astro` 中将：

```css
.article {
  max-width: 1000px;
  margin: 0 auto;
}
```

替换为：

```css
.article {
  max-width: 720px; /* 中文约 38–40 字/行的适读宽度 */
  margin: 0 auto;
}
```

- [ ] **Step 2: 文章大标题中文适配**

将：

```css
.article-title {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}
```

替换为：

```css
.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1.5rem;
  color: var(--color-text);
}
```

- [ ] **Step 3: meta 行与标签去大写/字距**

`.article-date` 中删除 `text-transform: uppercase;` 与 `letter-spacing: 0.5px;` 两行。
`.tag`（本页 scoped 的那条）中删除 `text-transform: uppercase;` 与 `letter-spacing: 0.5px;` 两行。

- [ ] **Step 4: 正文字号、行高与标题留白**

将：

```css
.article-content :global(h1),
.article-content :global(h2),
.article-content :global(h3),
.article-content :global(h4),
.article-content :global(h5),
.article-content :global(h6) {
  font-family: var(--font-mono);
  margin-top: 2rem;
  margin-bottom: 1rem;
  scroll-margin-top: 120px; /* 为固定头部留出空间 */
}
```

替换为：

```css
.article-content :global(h1),
.article-content :global(h2),
.article-content :global(h3),
.article-content :global(h4),
.article-content :global(h5),
.article-content :global(h6) {
  font-family: var(--font-sans);
  margin-top: 2rem;
  margin-bottom: 1rem;
  scroll-margin-top: 120px; /* 为固定头部留出空间 */
}
```

在 `.article-content :global(h2)` 规则中追加一行 `margin-top: 2.5rem;`。

将 `.article-content { ... }` 规则中追加一行 `font-size: 1.0625rem;`（17px）。

将：

```css
.article-content :global(p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}
```

替换为：

```css
.article-content :global(p) {
  margin-bottom: 1.75rem;
  line-height: 1.8;
}
```

将 `.article-content :global(li)` 中 `line-height: 1.6;` 改为 `line-height: 1.8;`。

- [ ] **Step 5: 首页 hero 与 section 标题中文适配**

`index.astro` 中：

`.hero-title` 删除 `text-transform: uppercase;` 与 `letter-spacing: 2px;` 两行（`.hero-subtitle` 是纯英文 "DIGITAL GARDEN"，其 `letter-spacing: 3px` 保留）。

将：

```css
.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
}
```

替换为：

```css
.section-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  font-family: var(--font-sans);
  position: relative;
}
```

`.stat-label` 中删除 `text-transform: uppercase;` 与 `letter-spacing: 1px;` 两行，并将 `font-family: var(--font-mono);` 改为 `font-family: var(--font-sans);`。

（hero 右侧代码窗口 `.code-snippet` 保持等宽字体，属于「代码」语境，不动。）

- [ ] **Step 6: 构建验证**

Run: `npm run build`
Expected: 构建成功。

- [ ] **Step 7: Commit**

```bash
git add src/pages/posts/[...slug].astro src/pages/index.astro
git commit -m "ui: 阅读页适读栏宽与行距，首页标题中文排版适配"
```

---

### Task 7: 全站双模式视觉 QA

**Files:**
- 无新改动（发现回归则修哪补哪，并在本任务内提交修复）。

**Interfaces:**
- Consumes: Task 1–6 的全部改动。

- [ ] **Step 1: 启动本地站点**

Run: `npm run build && npm run preview`（后台运行）
Expected: 输出本地地址（默认 `http://localhost:4321`）。

- [ ] **Step 2: 浏览器截图核对（浅色模式）**

用浏览器依次打开并截图检查：
1. `/` 首页：hero 中文为文楷、无大写字距残留；卡片网格整齐、摘要 3 行截断；背景为单层细噪点。
2. `/posts` 列表页：卡片一致。
3. 任一文章详情页（如 `/posts/etag`）：栏宽明显收窄、行距舒展、标题为文楷、代码块高亮与复制按钮正常。
4. 导航：当前页仅「文字变色 + 底部短下划线」一种指示，hover 无跳动。

- [ ] **Step 3: 浏览器截图核对（深色模式）**

点击主题切换按钮，重复 Step 2 的四项检查；额外确认深色下 muted 文字（卡片日期、行号）清晰可读。

- [ ] **Step 4: 移动端宽度抽查**

将浏览器窗口调至 ~390px 宽，检查首页与文章页无横向滚动、导航换行正常、激活下划线位置正确。

- [ ] **Step 5: 修复发现的回归并提交**

如有问题：修复 → `npm run build` → 重新截图确认 → 提交：

```bash
git add -A
git commit -m "ui: 视觉 QA 回归修复"
```

如无问题，本任务无提交。

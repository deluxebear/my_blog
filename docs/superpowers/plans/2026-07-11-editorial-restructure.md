# 全站文集头版式结构重构 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把六个页面从「卡片网格 + hero」模板结构重排为文集头版式（头条/目录/清单），去除 AI 模板感，内容与功能零改动。

**Architecture:** 纯前端模板+样式重排。新增 Footer 与 PostList 两个组件承载共享结构；Header 压缩单行；六页逐页换模板。数据获取（Astro.glob、GitHub GraphQL）、搜索、主题切换、筛选 JS 逻辑保留，仅按需更新 DOM 选择器。

**Tech Stack:** Astro 5、原生 CSS（沿用现有 CSS 变量体系：`--font-sans` 文楷 / `--font-mono` JetBrains Mono / `--color-*` 牛皮纸色板）。

**设计依据:** `docs/superpowers/specs/2026-07-11-editorial-restructure-design.md`

## Global Constraints

- 不改任何 Markdown 文章内容与站点文字性内容（自我介绍、关于页文字、工具描述照搬到新模板）。
- 不动功能逻辑：搜索（fuse.js + /api/search.json）、主题切换、代码高亮/复制、GitHub GraphQL 抓取、RSS、sitemap。筛选类 JS 允许且仅允许更新 DOM 选择器与「空分组隐藏」适配。
- 不改路由与 URL；不新增 npm 依赖。
- 配色、字体、纹理不变；含中文文本一律不用 `text-transform: uppercase` 与 `letter-spacing`。
- 栏宽体系：阅读/正文栏 720px；首页头版容器 880px。
- 本项目无测试框架：每任务验证 = `npm run build` 成功 + 任务指定检查；最后统一视觉 QA。
- 日期展示：目录行与次条用 `MM-DD`；头条 meta 用 `YYYY 年 M 月 D 日`；分组标题用 `YYYY 年 M 月`（按月）或 `YYYY`（按年）。

---

### Task 1: Footer 组件与 Layout 挂载

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/Layout.astro`（body 内 `<slot />` 之后）

**Interfaces:**
- Produces: 全站页脚（Layout 自动挂载，页面无需引入）。后续所有页面的「min-height: calc(100vh - 80px)」类规则不受影响，无需为 footer 调整。

- [ ] **Step 1: 创建 Footer.astro**

```astro
---
const year = new Date().getFullYear();
---

<footer class="footer">
  <div class="container footer-inner">
    <span class="footer-brand">数得其道 © {year}</span>
    <nav class="footer-links">
      <a href="/rss.xml">RSS</a>
      <a href="https://github.com/deluxebear" target="_blank" rel="noopener noreferrer">GitHub</a>
    </nav>
  </div>
</footer>

<style>
  .footer {
    margin-top: 4rem;
    border-top: 1px solid var(--color-border);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-top: 1.25rem;
    padding-bottom: 2rem;
    font-size: 0.8125rem;
    color: var(--color-muted);
  }

  .footer-links {
    display: flex;
    gap: 1.25rem;
  }

  .footer-links a {
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-weight: 500;
  }

  .footer-links a:hover {
    color: var(--color-accent);
  }
</style>
```

- [ ] **Step 2: Layout 挂载 Footer**

在 `src/layouts/Layout.astro` frontmatter 中加入 `import Footer from "../components/Footer.astro";`，并把 body 中的

```html
<body>
  <slot />
```

改为

```html
<body>
  <slot />
  <Footer />
```

（其后的 `<script>` 等保持不动。）

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 成功。

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro src/layouts/Layout.astro
git commit -m "restructure: 新增单行页脚并全站挂载"
```

---

### Task 2: 日期工具与 PostList 目录清单组件

**Files:**
- Create: `src/utils/date.ts`
- Create: `src/components/PostList.astro`

**Interfaces:**
- Produces:
  - `fmtMonthDay(d: Date): string` → `"07-08"`；`fmtFull(d: Date): string` → `"2026 年 7 月 10 日"`；`monthLabel(d: Date): string` → `"2026 年 7 月"`；`yearLabel(d: Date): string` → `"2026"`。
  - `<PostList posts={items} groupBy="month|year" />`，`items: { slug: string; title: string; pubDate: Date; tags: string[] }[]`（须已按时间倒序）。每行输出 `li.post-row[data-tags="tag1,tag2"]`，行内 `a.row-title` + `span.row-leader` + `time.row-date`；分组容器 `section.post-group[data-group]`，组标题 `h2.group-label`。Task 4、5 依赖这些类名与 data 属性。

- [ ] **Step 1: 创建 src/utils/date.ts**

```ts
export function fmtMonthDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}-${day}`;
}

export function fmtFull(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function monthLabel(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

export function yearLabel(d: Date): string {
  return String(d.getFullYear());
}
```

- [ ] **Step 2: 创建 src/components/PostList.astro**

```astro
---
import { fmtMonthDay, monthLabel, yearLabel } from "../utils/date";

export interface PostItem {
  slug: string;
  title: string;
  pubDate: Date;
  tags: string[];
}

export interface Props {
  posts: PostItem[];
  groupBy?: "month" | "year";
}

const { posts, groupBy = "month" } = Astro.props;

const label = (d: Date) => (groupBy === "year" ? yearLabel(d) : monthLabel(d));

const groups: { key: string; items: PostItem[] }[] = [];
for (const post of posts) {
  const key = label(post.pubDate);
  const last = groups[groups.length - 1];
  if (last && last.key === key) {
    last.items.push(post);
  } else {
    groups.push({ key, items: [post] });
  }
}
---

<div class="post-list">
  {
    groups.map((group) => (
      <section class="post-group" data-group={group.key}>
        <h2 class="group-label">{group.key}</h2>
        <ul class="post-rows">
          {group.items.map((post) => (
            <li
              class="post-row"
              data-tags={(post.tags || []).map((t) => t.toLowerCase()).join(",")}
            >
              <a href={`/posts/${post.slug}`} class="row-title">
                {post.title}
              </a>
              <span class="row-leader" aria-hidden="true" />
              <time class="row-date" datetime={post.pubDate.toISOString()}>
                {fmtMonthDay(post.pubDate)}
              </time>
            </li>
          ))}
        </ul>
      </section>
    ))
  }
</div>

<style>
  .post-group {
    margin-bottom: 2rem;
  }

  .group-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-muted);
    font-family: var(--font-mono);
    margin-bottom: 0.75rem;
  }

  .post-rows {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .post-row {
    display: flex;
    align-items: baseline;
    gap: 0.75em;
    padding: 0.45rem 0;
  }

  .row-title {
    font-family: var(--font-sans);
    font-size: 1.0625rem;
    font-weight: 500;
    color: var(--color-text);
    text-decoration: none;
  }

  .row-title:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  .row-leader {
    flex: 1;
    min-width: 2em;
    border-bottom: 1px dotted var(--color-border);
    transform: translateY(-0.25em);
  }

  .row-date {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-muted);
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .row-title {
      font-size: 1rem;
    }
  }
</style>
```

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 成功（组件暂无使用方，仅验证语法）。

- [ ] **Step 4: Commit**

```bash
git add src/utils/date.ts src/components/PostList.astro
git commit -m "restructure: 新增日期工具与目录清单组件 PostList"
```

---

### Task 3: Header 压缩为单行

**Files:**
- Modify: `src/components/Header.astro`（模板 + 样式；`<script>` 逐字节不动）

**Interfaces:**
- Consumes: 上一轮的激活态样式约定（accent 色 + 2px 下划线）。
- Produces: 单行 Header；导航仅「文章/工具/项目/关于」四项。

- [ ] **Step 1: 替换模板**

将 `<header>...</header>` 整段替换为：

```astro
<header class="header">
  <div class="container">
    <div class="header-content">
      <a href="/" class="brand">
        <img src={logo.src} alt="数得其道 Logo" width="32" height="32" class="brand-logo" />
        <span class="brand-name">数得其道</span>
      </a>

      <nav class="nav">
        <ul class="nav-list">
          <li><a href="/posts" class="nav-link" data-page="posts">文章</a></li>
          <li><a href="/tools" class="nav-link" data-page="tools">工具</a></li>
          <li>
            <a href="/projects" class="nav-link" data-page="projects">项目</a>
          </li>
          <li><a href="/about" class="nav-link" data-page="about">关于</a></li>
        </ul>
        <button
          id="theme-toggle"
          class="theme-toggle"
          aria-label="切换主题"
        >
          <span class="theme-icon">◐</span>
        </button>
      </nav>
    </div>
  </div>
</header>
```

（frontmatter 的 `import logo` 保留；「首页」「RSS」导航项与副标题按设计移除。）

- [ ] **Step 2: 替换样式**

将 `<style>` 整段替换为：

```css
  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    gap: 1.5rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--color-text);
    min-width: 0;
  }

  .brand:hover {
    text-decoration: none;
    color: var(--color-text);
  }

  .brand-logo {
    display: block;
    border: none;
    border-radius: 0;
  }

  .brand-name {
    font-family: var(--font-sans);
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .nav-list {
    display: flex;
    list-style: none;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    align-items: center;
  }

  .nav-link {
    font-family: var(--font-sans);
    font-weight: 600;
    padding: 0.5rem 0.75rem;
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
    bottom: 0.15rem;
    left: 0.75rem;
    right: 0.75rem;
    height: 2px;
    background-color: var(--color-accent);
  }

  .theme-toggle {
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 0;
    width: 34px;
    height: 34px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: var(--color-text);
  }

  .theme-toggle:hover {
    background-color: var(--color-accent);
    color: var(--color-bg);
    border-color: var(--color-accent);
  }

  .theme-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  @media (max-width: 768px) {
    .header-content {
      gap: 0.75rem;
    }

    .brand-name {
      font-size: 1.125rem;
    }

    .nav-link {
      font-size: 0.875rem;
      padding: 0.5rem 0.5rem;
    }

    .nav-link.active::after {
      left: 0.5rem;
      right: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .brand-logo {
      width: 28px;
      height: 28px;
    }

    .nav-link {
      font-size: 0.8125rem;
      padding: 0.4rem 0.4rem;
    }
  }
```

- [ ] **Step 3: `<script>` 保持逐字节不动**

主题切换与 setActiveNavLink 脚本原样保留（home/rss 分支永不匹配即可，无害）。

- [ ] **Step 4: 构建验证与检查**

Run: `npm run build`
Expected: 成功。
Check: `grep -c "nav-link" src/components/Header.astro` 的模板部分只余 4 个导航项；`grep -n "site-subtitle\|rss-link\|data-page=\"home\"" src/components/Header.astro` 无匹配。

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro
git commit -m "restructure: Header 压缩为单行——站名即首页，RSS 移页脚"
```

---

### Task 4: 首页文集头版

**Files:**
- Modify: `src/pages/index.astro`（整文件重写）

**Interfaces:**
- Consumes: `PostList`（Task 2 的 props 与类名）、`fmtFull`（utils/date）。
- Produces: 首页不再引用 `PostCard`、`SearchBox`。

- [ ] **Step 1: 重写 index.astro**

```astro
---
import Layout from "../layouts/Layout.astro";
import Header from "../components/Header.astro";
import PostList from "../components/PostList.astro";
import { fmtFull, fmtMonthDay } from "../utils/date";

const allPosts = await Astro.glob("../content/posts/*.{md,mdx}");
const posts = allPosts
  .map((post) => ({
    slug:
      post.file
        .split("/")
        .pop()
        ?.replace(/\.mdx?$/, "") || "",
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    pubDate: new Date(post.frontmatter.pubDate),
    tags: post.frontmatter.tags || [],
    featured: !!post.frontmatter.featured,
  }))
  .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

const headline = posts.find((p) => p.featured) ?? posts[0];
const rest = posts.filter((p) => p !== headline);
const secondary = rest.slice(0, 2);
const archive = rest.slice(2);
---

<Layout title="数得其道 - 探索数字世界中的道法术器">
  <Header />

  <main class="main">
    <div class="container front">
      <p class="epigraph">道 · 法 · 术 · 器 —— 探索数字世界中的道法术器</p>

      <article class="headline">
        <h1 class="headline-title">
          <a href={`/posts/${headline.slug}`}>{headline.title}</a>
        </h1>
        <p class="headline-meta">
          <time datetime={headline.pubDate.toISOString()}>
            {fmtFull(headline.pubDate)}
          </time>
          {headline.tags.map((tag) => <span class="meta-tag">#{tag}</span>)}
        </p>
        <p class="headline-excerpt">{headline.description}</p>
        <a class="headline-more" href={`/posts/${headline.slug}`}>继续阅读 →</a>
      </article>

      {
        secondary.length > 0 && (
          <div class="secondary">
            {secondary.map((post) => (
              <article class="secondary-item">
                <h2 class="secondary-title">
                  <a href={`/posts/${post.slug}`}>{post.title}</a>
                </h2>
                <p class="secondary-excerpt">{post.description}</p>
                <time class="secondary-date" datetime={post.pubDate.toISOString()}>
                  {fmtMonthDay(post.pubDate)}
                </time>
              </article>
            ))}
          </div>
        )
      }

      {
        archive.length > 0 && (
          <section class="archive">
            <PostList posts={archive} groupBy="month" />
          </section>
        )
      }
    </div>
  </main>
</Layout>

<style>
  .main {
    min-height: calc(100vh - 80px);
    padding: 2.5rem 0 0;
  }

  .front {
    max-width: 880px;
  }

  .epigraph {
    font-size: 0.9375rem;
    color: var(--color-secondary);
    margin-bottom: 2.5rem;
  }

  .headline {
    border-top: 2px solid var(--color-text);
    border-bottom: 1px solid var(--color-border);
    padding: 2rem 0 2.25rem;
    margin-bottom: 2.5rem;
  }

  .headline-title {
    font-size: 2.75rem;
    font-weight: 700;
    line-height: 1.25;
    margin-bottom: 1rem;
  }

  .headline-title a {
    color: var(--color-text);
    text-decoration: none;
  }

  .headline-title a:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  .headline-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1em;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-muted);
    margin-bottom: 1.25rem;
  }

  .meta-tag {
    color: var(--color-accent);
  }

  .headline-excerpt {
    font-size: 1.125rem;
    line-height: 1.8;
    color: var(--color-secondary);
    max-width: 40em;
    margin-bottom: 1.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .headline-more {
    font-family: var(--font-sans);
    font-weight: 600;
    color: var(--color-accent);
  }

  .secondary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 2.5rem;
  }

  .secondary-title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  .secondary-title a {
    color: var(--color-text);
    text-decoration: none;
  }

  .secondary-title a:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  .secondary-excerpt {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--color-secondary);
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .secondary-date {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-muted);
  }

  @media (max-width: 768px) {
    .headline-title {
      font-size: 1.75rem;
    }

    .headline-excerpt {
      font-size: 1rem;
    }

    .secondary {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
```

- [ ] **Step 2: 构建验证与检查**

Run: `npm run build`
Expected: 成功。
Check: `grep -n "PostCard\|SearchBox\|hero\|stat-\|code-snippet" src/pages/index.astro` 无匹配。

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "restructure: 首页改为文集头版——头条/次条/按月目录"
```

---

### Task 5: 文章列表页目录化

**Files:**
- Modify: `src/pages/posts/index.astro`（整文件重写；原文件底部 `<script>` 的筛选逻辑迁移并只改选择器）

**Interfaces:**
- Consumes: `PostList`（`li.post-row[data-tags]`、`section.post-group`）、`SearchBox`。
- Produces: 本页不再引用 `PostCard`。

- [ ] **Step 1: 重写模板与数据部分**

frontmatter 保留现有 posts/tagStats 计算（tagStats、featuredTags、remainingTags 逻辑照搬），把 `import PostCard` 换成 `import PostList from '../../components/PostList.astro';` 与 `import SearchBox from '../../components/SearchBox.astro';`。posts 映射需输出 PostList 需要的形状：

```js
const posts = allPosts
  .map(post => ({
    slug: post.file.split('/').pop()?.replace(/\.mdx?$/, '') || '',
    title: post.frontmatter.title,
    pubDate: new Date(post.frontmatter.pubDate),
    tags: post.frontmatter.tags || [],
  }))
  .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
```

（tagStats 相应用 `post.tags` 而非 `post.data.tags`。）

模板主体替换为：

```astro
<Layout title="所有文章 - 数得其道">
  <Header />

  <main class="main">
    <div class="container page">
      <header class="page-header">
        <h1 class="page-title">所有文章</h1>
        <p class="page-count">共 {posts.length} 篇</p>
      </header>

      <section class="search-section">
        <SearchBox />
      </section>

      {
        tagStats.length > 0 && (
          <nav class="tag-nav" aria-label="按标签筛选">
            <button class="tag-filter active" data-tag="all">全部</button>
            {tagStats.map(({ tag, count }) => (
              <button class="tag-filter" data-tag={tag}>
                #{tag} <span class="tag-count">×{count}</span>
              </button>
            ))}
          </nav>
        )
      }

      <section class="posts-section" id="posts-section">
        <PostList posts={posts} groupBy="year" />
        <div class="no-results hidden" id="no-results">
          <p>没有找到符合条件的文章</p>
        </div>
      </section>
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: 替换样式**

```css
  .main {
    min-height: calc(100vh - 80px);
    padding: 2.5rem 0 0;
  }

  .page {
    max-width: 880px;
  }

  .page-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    border-bottom: 2px solid var(--color-text);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }

  .page-count {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-muted);
    margin: 0;
  }

  .search-section {
    margin-bottom: 1.5rem;
  }

  .tag-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin-bottom: 2.5rem;
    font-size: 0.875rem;
  }

  .tag-filter {
    background: none;
    border: none;
    padding: 0.15rem 0;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--color-secondary);
    transition: color 0.2s ease;
  }

  .tag-filter:hover {
    color: var(--color-accent);
  }

  .tag-filter.active {
    color: var(--color-accent);
    font-weight: 600;
  }

  .tag-count {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--color-muted);
  }

  .no-results {
    padding: 2rem 0;
    color: var(--color-secondary);
  }

  .hidden {
    display: none;
  }
```

- [ ] **Step 3: 迁移筛选脚本（仅改选择器与空分组隐藏）**

原 `<script>` 的筛选逻辑保留，做三处适配：

1. 文章元素选择器：原 `.post-card`（或 `#posts-grid` 子项）→ `#posts-section .post-row`；
2. 每次筛选后隐藏空分组，并同步 no-results：

```js
document.querySelectorAll('#posts-section .post-group').forEach((group) => {
  const hasVisible = group.querySelector('.post-row:not(.hidden)') !== null;
  group.classList.toggle('hidden', !hasVisible);
});
const anyVisible = document.querySelector('#posts-section .post-row:not(.hidden)') !== null;
document.getElementById('no-results')?.classList.toggle('hidden', anyVisible);
```

3. 隐藏行用 `classList.add('hidden')`/`remove('hidden')`（原实现若用 style.display 亦改为 hidden class，与上面的空分组检测保持一致）。

`data-tags` 读取逻辑不变（PostList 已在 `li.post-row` 输出小写逗号分隔 `data-tags`）。

- [ ] **Step 4: 构建验证与检查**

Run: `npm run build`
Expected: 成功。
Check: `grep -n "PostCard\|posts-grid\|tags-section\|details" src/pages/posts/index.astro` 无匹配。

- [ ] **Step 5: Commit**

```bash
git add src/pages/posts/index.astro
git commit -m "restructure: 文章列表改按年目录清单，标签筛选行内化"
```

---

### Task 6: 阅读页去卡片、左对齐、去徽章

**Files:**
- Modify: `src/pages/posts/[...slug].astro`（模板小改 + 样式三处）

**Interfaces:**
- Consumes: 上一轮已定的 720px 栏宽、行距体系（全部保留）。

- [ ] **Step 1: 模板删除精选徽章**

删除模板中：

```astro
{featured && <div class="featured-badge">⭐ 精选文章</div>}
```

（frontmatter 中解构出的 `featured` 变量一并移除以免未使用告警。）

- [ ] **Step 2: 标题区左对齐**

`.article-header` 规则中 `text-align: center;` 删除；`.article-meta` 规则中 `justify-content: center;` 改为 `justify-content: flex-start;`。删除 `.featured-badge` 整条规则。

- [ ] **Step 3: 去正文卡片包裹**

将：

```css
.article-content {
  background-color: var(--color-card);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 3rem;
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 100%;
  font-size: 1.0625rem;
}
```

替换为：

```css
.article-content {
  width: 100%;
  max-width: 100%;
  font-size: 1.0625rem;
}
```

同时删除各断点 media query 中针对 `.article-content` 的 `padding: 2rem;`、`padding: 1.5rem;` 覆盖（若 Layout.astro 全局仍有 `.article-content { background-color…box-shadow… }` 规则，将该全局规则一并删除——它在上一轮被简化为背景+阴影两行，本轮正文不再需要卡片背景）。

- [ ] **Step 4: 构建验证与检查**

Run: `npm run build`
Expected: 成功。
Check: `grep -n "featured-badge\|text-align: center" "src/pages/posts/[...slug].astro"` 无匹配；`grep -n "article-content" src/layouts/Layout.astro` 无背景/阴影规则残留。

- [ ] **Step 5: Commit**

```bash
git add "src/pages/posts/[...slug].astro" src/layouts/Layout.astro
git commit -m "restructure: 阅读页去卡片包裹、标题左对齐、删除精选徽章"
```

---

### Task 7: 工具页索引化

**Files:**
- Modify: `src/pages/tools/index.astro`（frontmatter 的 tools 数组照搬；模板与样式重写）

**Interfaces:**
- Consumes: 现有 `tools: Tool[]` 数据（含 `category`、`comingSoon`）。

- [ ] **Step 1: 重写模板**

frontmatter 末尾追加分组计算：

```js
const categories = [...new Set(tools.map((t) => t.category))];
```

模板主体替换为：

```astro
<Layout title="在线工具 - 数得其道" description="实用的在线工具集合">
  <Header />

  <main class="main">
    <div class="container page">
      <header class="page-header">
        <h1 class="page-title">在线工具</h1>
        <p class="page-count">共 {tools.length} 个</p>
      </header>

      {
        categories.map((category) => (
          <section class="tool-group">
            <h2 class="group-label">{category}</h2>
            <ul class="tool-rows">
              {tools
                .filter((t) => t.category === category)
                .map((tool) => (
                  <li class="tool-row">
                    {tool.comingSoon ? (
                      <span class="tool-name muted">{tool.name}</span>
                    ) : (
                      <a href={tool.url} class="tool-name">
                        {tool.name}
                      </a>
                    )}
                    <span class="tool-desc">— {tool.description}</span>
                    {tool.comingSoon && <span class="soon">（即将上线）</span>}
                  </li>
                ))}
            </ul>
          </section>
        ))
      }
    </div>
  </main>
</Layout>
```

- [ ] **Step 2: 重写样式**

```css
  .main {
    min-height: calc(100vh - 80px);
    padding: 2.5rem 0 0;
  }

  .page {
    max-width: 720px;
  }

  .page-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    border-bottom: 2px solid var(--color-text);
    padding-bottom: 1rem;
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }

  .page-count {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-muted);
    margin: 0;
  }

  .tool-group {
    margin-bottom: 2rem;
  }

  .group-label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-muted);
    font-family: var(--font-mono);
    margin-bottom: 0.75rem;
  }

  .tool-rows {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .tool-row {
    padding: 0.45rem 0;
    line-height: 1.7;
  }

  .tool-name {
    font-family: var(--font-sans);
    font-weight: 600;
    color: var(--color-text);
  }

  a.tool-name:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  .tool-name.muted {
    color: var(--color-muted);
  }

  .tool-desc {
    color: var(--color-secondary);
    font-size: 0.9375rem;
  }

  .soon {
    font-size: 0.8125rem;
    color: var(--color-muted);
  }
```

（原统计块、emoji 图标、features 标签、卡片网格样式全部删除；各 `/tools/*` 子页面不动。）

- [ ] **Step 3: 构建验证与检查**

Run: `npm run build`
Expected: 成功。
Check: `grep -n "tool-card\|features\|icon" src/pages/tools/index.astro` 模板部分无匹配（frontmatter 数据里的 `icon`/`features` 字段保留不引用即可）。

- [ ] **Step 4: Commit**

```bash
git add src/pages/tools/index.astro
git commit -m "restructure: 工具页改分类索引清单"
```

---

### Task 8: 项目页清单化

**Files:**
- Modify: `src/pages/projects.astro`（frontmatter 抓取逻辑照搬；模板与样式重写；topic 筛选脚本仅改选择器）

**Interfaces:**
- Consumes: 现有 GitHub GraphQL 抓取结果（name/description/url/primaryLanguage/stargazerCount/forkCount/topics/isArchived）与 `getLanguageColor`。

- [ ] **Step 1: 重写模板主体**

页面 header 与清单替换为：

```astro
<main class="main">
  <div class="container page">
    <header class="page-header">
      <h1 class="page-title">项目</h1>
      <a
        href="https://github.com/deluxebear"
        target="_blank"
        rel="noopener noreferrer"
        class="gh-link">GitHub ↗</a
      >
    </header>

    {
      allTopics.length > 0 && (
        <nav class="topic-nav" aria-label="按技术筛选">
          <button class="topic-filter active" data-filter="all">全部</button>
          {allTopics.map((topic) => (
            <button class="topic-filter" data-filter={topic}>
              #{topic}
            </button>
          ))}
        </nav>
      )
    }

    <ul class="project-rows" id="project-rows">
      {
        projects.map((project) => (
          <li class="project-row" data-topics={project.topics.join(",")}>
            <div class="project-line">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                class="project-name"
              >
                {project.name}
              </a>
              {project.isArchived && <span class="archived">已归档</span>}
            </div>
            <p class="project-desc">{project.description}</p>
            <p class="project-meta">
              {project.language && (
                <span class="meta-lang">
                  <span
                    class="lang-dot"
                    style={`background-color: ${getLanguageColor(project.language)}`}
                  />
                  {project.language}
                </span>
              )}
              <span>★ {project.stars}</span>
              <span>⑂ {project.forks}</span>
            </p>
          </li>
        ))
      }
    </ul>
  </div>
</main>
```

（变量名以现文件实际字段为准——实施时先读原模板，保持数据字段一一对应；PINNED/FEATURED 徽章不再渲染。若原文件用 `project.stargazerCount` 就沿用之。）

- [ ] **Step 2: 重写样式**

```css
  .main {
    min-height: calc(100vh - 80px);
    padding: 2.5rem 0 0;
  }

  .page {
    max-width: 720px;
  }

  .page-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 2px solid var(--color-text);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
  }

  .gh-link {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--color-accent);
  }

  .topic-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    margin-bottom: 2rem;
  }

  .topic-filter {
    background: none;
    border: none;
    padding: 0.15rem 0;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-secondary);
    transition: color 0.2s ease;
  }

  .topic-filter:hover,
  .topic-filter.active {
    color: var(--color-accent);
  }

  .topic-filter.active {
    font-weight: 600;
  }

  .project-rows {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .project-row {
    padding: 1.25rem 0;
    border-bottom: 1px solid var(--color-border);
  }

  .project-row:last-child {
    border-bottom: none;
  }

  .project-line {
    display: flex;
    align-items: baseline;
    gap: 0.75em;
    margin-bottom: 0.35rem;
  }

  .project-name {
    font-family: var(--font-mono);
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .project-name:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  .archived {
    font-size: 0.75rem;
    color: var(--color-muted);
    border: 1px solid var(--color-border);
    padding: 0 0.4em;
  }

  .project-desc {
    color: var(--color-secondary);
    font-size: 0.9375rem;
    line-height: 1.7;
    margin-bottom: 0.5rem;
  }

  .project-meta {
    display: flex;
    gap: 1.25em;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-muted);
    margin: 0;
  }

  .meta-lang {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
  }

  .lang-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .hidden {
    display: none;
  }
```

- [ ] **Step 3: 筛选脚本仅改选择器**

原 topic 筛选 `<script>` 保留逻辑，把项目元素选择器（原 `.project-card`）改为 `#project-rows .project-row`，显示/隐藏改用 `hidden` class；`data-topics` 读取不变。

- [ ] **Step 4: 构建验证与检查**

Run: `npm run build`
Expected: 成功（GitHub 抓取失败时的现有 fallback 行为保持）。
Check: `grep -n "project-card\|projects-grid\|pinned-badge\|featured-badge" src/pages/projects.astro` 无匹配。

- [ ] **Step 5: Commit**

```bash
git add src/pages/projects.astro
git commit -m "restructure: 项目页改清单式，保留 GitHub 抓取与筛选"
```

---

### Task 9: 关于页单栏文章化

**Files:**
- Modify: `src/pages/about.astro`（模板重排 + 样式重写；全部文字内容逐字保留）

**Interfaces:**
- Consumes: 现有六个区块的文字内容（intro、关于我、专业领域、博客理念、联系交流、成长轨迹）。

- [ ] **Step 1: 重排模板**

目标结构（把现有各 `.content-block`、`.timeline-section` 的**全部文字节点原样搬入**对应 section，不得改写、删减任何文字）：

```astro
<main class="main">
  <div class="container page">
    <header class="about-header">
      <img src={avatar.src} alt="Eric 的头像" width="72" height="72" class="avatar" />
      <div>
        <h1 class="name">Eric</h1>
        <p class="title">工程师 · 系统思维实践者</p>
      </div>
    </header>

    <blockquote class="motto">
      "技术是手段，认知是核心，行动是连接理想与现实的唯一路径。"
    </blockquote>

    <section class="about-section">
      <h2>关于我</h2>
      <!-- 原「关于我」block 的全部 <p> 原样迁入 -->
    </section>

    <section class="about-section">
      <h2>专业领域</h2>
      <!-- 原块内容原样迁入（含列表结构） -->
    </section>

    <section class="about-section">
      <h2>博客理念</h2>
      <!-- 原块内容原样迁入 -->
    </section>

    <section class="about-section">
      <h2>联系交流</h2>
      <!-- 原块内容原样迁入（含链接） -->
    </section>

    <section class="about-section">
      <h2>成长轨迹</h2>
      <!-- 原 timeline 各条目文字原样迁入；时间线可简化为「年份 — 描述」列表行 -->
    </section>
  </div>
</main>
```

注意：注释仅为迁移指引，最终文件中不留这些注释；「ERIC」全大写改为「Eric」（英文人名正常大小写，不算改内容）。

- [ ] **Step 2: 重写样式**

```css
  .main {
    min-height: calc(100vh - 80px);
    padding: 2.5rem 0 0;
  }

  .page {
    max-width: 720px;
  }

  .about-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .avatar {
    border-radius: 50%;
    border: 1px solid var(--color-border);
  }

  .name {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .title {
    color: var(--color-secondary);
    font-size: 0.9375rem;
    margin: 0;
  }

  .motto {
    border-left: 3px solid var(--color-accent);
    padding: 0.75rem 1.25rem;
    margin: 0 0 2.5rem;
    color: var(--color-secondary);
    font-style: normal;
    background: none;
    border-radius: 0;
  }

  .about-section {
    margin-bottom: 2.5rem;
  }

  .about-section h2 {
    font-size: 1.375rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }

  .about-section p,
  .about-section li {
    line-height: 1.8;
    color: var(--color-text);
  }

  .timeline-item {
    display: flex;
    gap: 1em;
    align-items: baseline;
    padding: 0.35rem 0;
  }

  .timeline-year {
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    color: var(--color-muted);
    white-space: nowrap;
  }
```

（原 intro-section 双栏、content-grid、industrial-border 引用、quote-block 样式全部删除；如原块内还有细分样式类，迁移文字时保留语义标签 p/ul/strong/a，丢弃装饰性 wrapper div。）

- [ ] **Step 3: 构建验证与检查**

Run: `npm run build`
Expected: 成功。
Check: `grep -n "content-block\|content-grid\|industrial-border\|quote-block" src/pages/about.astro` 无匹配；抽两句原文（如格言、「我是 Eric」段首）grep 确认文字仍在。

- [ ] **Step 4: Commit**

```bash
git add src/pages/about.astro
git commit -m "restructure: 关于页改单栏文章式排版"
```

---

### Task 10: 删除 PostCard 与全站残留清理

**Files:**
- Delete: `src/components/PostCard.astro`
- Modify: `src/layouts/Layout.astro`（若存在 `.post-card` 全局样式则删除）

- [ ] **Step 1: 确认无引用后删除**

Run: `grep -rn "PostCard" src/ --include="*.astro" --include="*.ts"`
Expected: 仅 `src/components/PostCard.astro` 自身。
然后 `git rm src/components/PostCard.astro`。

- [ ] **Step 2: 清理全局残留**

`grep -n "post-card\|project-card" src/layouts/Layout.astro` —— 上一轮 Layout 中有 `.post-card, .project-card { background-color…box-shadow… }` 规则，两个类均已无使用方，删除该规则。`grep -rn "post-card" src/` 应零匹配。

- [ ] **Step 3: 构建验证**

Run: `npm run build`
Expected: 成功。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "restructure: 删除 PostCard 组件与卡片残留样式"
```

---

### Task 11: 全站视觉 QA（双主题 × 双宽度 × 六页）

**Files:**
- 无预定改动；发现回归修哪补哪。

- [ ] **Step 1: 启动**

Run: `npm run build && npm run preview`（后台，默认 http://localhost:4321）。

- [ ] **Step 2: 桌面浅色核对**

浏览器截图检查六页：`/`（头条→次条→目录层级、规则线、无 hero/代码窗残留）、`/posts`（搜索框、行内标签筛选可点且空分组隐藏、目录行 leader 点线对齐）、`/posts/etag`（左对齐标题、无卡片包裹、TOC 正常、代码块复制正常）、`/tools`（分类索引、即将上线灰显）、`/projects`（清单、语言点、topic 筛选）、`/about`（单栏、时间线行）。页脚每页可见。

- [ ] **Step 3: 深色核对**

切主题重查六页，重点：规则线/点线在深色下可见但不刺眼、muted 文字可读。

- [ ] **Step 4: 移动端（~390px）核对**

`/`（头条字号降级、次条单栏、目录行日期不错位）、`/posts`、`/posts/etag`、`/about`；全站无横向滚动；Header 单行放得下。

- [ ] **Step 5: 回归修复与提交**

有问题：修复 → build → 复查 → `git commit -m "restructure: 视觉 QA 回归修复"`。无问题不提交。

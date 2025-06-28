# 数字花园 - 技术博客

一个基于 Astro 构建的现代化技术博客，专注于 Web 开发和创意编程。

## ✨ 特性

- 🚀 基于 [Astro](https://astro.build/) 构建，性能卓越
- 📝 支持 Markdown 和 MDX 内容格式
- 🔍 内置全文搜索功能 (基于 Fuse.js)
- 📱 响应式设计，适配各种设备
- 🎨 代码语法高亮 (Prism.js & Highlight.js)
- 📊 自动生成 RSS 订阅源
- 🗺️ 自动生成网站地图
- 📖 文章目录导航
- ⏱️ 阅读时间估算
- 🏷️ 标签分类系统

## 📁 项目结构

```
/
├── public/                 # 静态资源
│   └── favicon.svg
├── src/
│   ├── assets/            # 项目资源
│   ├── components/        # Astro 组件
│   │   ├── CodeBlock.astro
│   │   ├── Header.astro
│   │   ├── PostCard.astro
│   │   ├── SearchBox.astro
│   │   ├── TableOfContents.astro
│   │   └── Welcome.astro
│   ├── content/
│   │   └── posts/         # 博客文章 (Markdown)
│   ├── layouts/           # 页面布局
│   │   └── Layout.astro
│   ├── pages/             # 页面路由
│   │   ├── api/
│   │   ├── posts/
│   │   ├── about.astro
│   │   ├── index.astro
│   │   ├── projects.astro
│   │   └── rss.xml.ts
│   └── scripts/           # 客户端脚本
│       └── search.js
├── astro.config.mjs       # Astro 配置
├── package.json
└── tsconfig.json
```

## 🛠️ 技术栈

- **框架**: Astro 5.2.5
- **内容处理**: Markdown, MDX
- **搜索**: Fuse.js
- **语法高亮**: Prism.js, Highlight.js
- **RSS**: @astrojs/rss
- **网站地图**: @astrojs/sitemap
- **Markdown 增强**: 
  - remark-gfm (GitHub 风格 Markdown)
  - remark-smartypants (智能标点)
  - rehype-slug (标题锚点)
  - rehype-autolink-headings (标题链接)

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd my_blog

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

访问 `http://localhost:4321` 查看网站。

### 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📝 内容管理

### 添加新文章

1. 在 `src/content/posts/` 目录下创建新的 `.md` 文件
2. 添加 frontmatter 元数据：

```markdown
---
title: "文章标题"
description: "文章描述"
pubDate: 2025-01-27
tags: ["标签1", "标签2"]
featured: false
image: "https://example.com/image.jpg"
---

# 文章内容

这里是文章正文...
```

### Frontmatter 字段说明

- `title`: 文章标题
- `description`: 文章描述/摘要
- `pubDate`: 发布日期 (YYYY-MM-DD 格式)
- `tags`: 标签数组
- `featured`: 是否为精选文章 (布尔值)
- `image`: 文章封面图片 URL (可选)

## 🎨 自定义

### 主题配置

编辑 `src/layouts/Layout.astro` 来自定义全局样式和元信息。

### 组件定制

所有组件都在 `src/components/` 目录下，可以根据需要进行修改。

### 搜索功能

搜索功能基于 Fuse.js 实现，配置文件在 `src/scripts/search.js`。

## 📊 可用命令

| 命令 | 说明 |
|:-----|:-----|
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动开发服务器 (localhost:4321) |
| `npm run build` | 构建生产版本到 `./dist/` |
| `npm run preview` | 本地预览构建结果 |
| `npm run astro ...` | 运行 Astro CLI 命令 |

## 🔧 配置说明

### Astro 配置 (astro.config.mjs)

- 配置了 MDX 和 Sitemap 集成
- 启用了 GitHub 风格 Markdown
- 配置了标题自动链接
- 禁用了默认语法高亮（使用自定义方案）

### TypeScript 支持

项目完全支持 TypeScript，配置文件为 `tsconfig.json`。

## 🌐 部署

该项目可以部署到任何支持静态网站的平台：

- [Vercel](https://vercel.com/)
- [Netlify](https://netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## 📚 了解更多

- [Astro 文档](https://docs.astro.build)
- [Astro Discord 社区](https://astro.build/chat)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)
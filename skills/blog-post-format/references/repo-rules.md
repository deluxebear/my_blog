# Repository Rules

## Content location

- Store blog posts in `src/content/posts/`.
- Use `.md` for standard posts unless the task explicitly requires MDX components.

## Frontmatter schema

Every post in this repository follows this shape:

```md
---
title: "..."
description: "..."
pubDate: 2026-03-11
tags: ["Tag1", "Tag2"]
featured: false
image: "/post_imgs/post-slug.png"
---
```

Required fields:

- `title`: string, article title.
- `description`: string, one-sentence summary for cards and SEO.
- `pubDate`: date in `YYYY-MM-DD`.
- `tags`: non-empty array of strings.
- `featured`: boolean.
- `image`: site-root path for the cover image. Prefer a local image in `public/post_imgs/`.

## Body structure

- Repeat the title as the first `# ` heading immediately after frontmatter.
- Start with a short intro before the first `##`.
- Use `##` for major sections and `###` for subsections.
- Do not skip heading levels.
- Use ordered lists for step-by-step procedures.
- Use fenced code blocks with an explicit language whenever code or config appears.
- Keep block spacing clean: one blank line between paragraphs, lists, images, and code fences.

## Existing content patterns

- Long-form guides often use sections such as "为什么值得读", "背景与问题", "步骤", "FAQ", and "总结".
- Posts may use tables, callouts, and horizontal rules, but only when they improve scanability.
- Avoid decorative separators or emoji-heavy formatting unless the existing post already relies on it.

## Date rule

- When creating a new markdown post, set `pubDate` to the local current date at creation time.
- Treat `pubDate` as the article creation date unless the user explicitly asks to backdate or correct it.
- Do not copy `pubDate` values from older posts, templates, or examples.

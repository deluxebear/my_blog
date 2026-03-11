---
name: blog-post-format
description: Repository-specific markdown authoring rules for posts in `src/content/posts` in this Astro blog. Use when drafting, editing, reviewing, or normalizing a blog post's frontmatter, heading structure, section layout, lists, tables, callouts, code fences, or overall markdown formatting so the content matches the conventions already used by this project.
---

# Blog Post Format

Read `references/repo-rules.md` before writing if the task touches frontmatter or overall article structure.

## Workflow

1. Identify the target post in `src/content/posts/`.
2. Preserve the repository's frontmatter schema unless the user explicitly asks to change the content model.
3. Normalize the article body to the repository's heading and spacing conventions.
4. Keep edits content-focused. Do not rewrite tone, tags, or metadata that are outside the task.

## Rules

- Keep the required frontmatter fields in this order: `title`, `description`, `pubDate`, `tags`, `featured`, `image`.
- Keep `pubDate` in `YYYY-MM-DD`.
- For a newly created post, set `pubDate` to the local current date on the day the markdown file is created.
- Do not invent a future `pubDate`. Do not reuse an older date from examples or templates.
- Keep `tags` as a YAML array of strings.
- Repeat the `title` as the first H1 in the body.
- Start with a short intro before the first H2.
- Use `##` for major sections and `###` for subsections. Do not jump from `#` to `###`.
- Use ordered lists for sequences and unordered lists for grouped points.
- Use fenced code blocks with an explicit language.
- Keep markdown clean and stable: one blank line between blocks, no trailing clutter, no decorative markup that does not add meaning.

## When Revising Existing Posts

- Preserve the existing voice unless the user requests a rewrite.
- Do not churn headings or separators unless they violate the repository pattern or block the requested change.
- Preserve valid tables, blockquotes, and FAQ sections if they improve readability.
- If the existing post mixes styles, normalize only the part you are touching unless the user asks for a full cleanup.

## Output Expectations

- Produce markdown that can be committed directly into `src/content/posts/`.
- If metadata or structure is ambiguous, follow the existing repository pattern instead of inventing a new one.
- If the task also touches images, use `blog-post-images` together with this skill.

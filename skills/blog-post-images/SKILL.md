---
name: blog-post-images
description: Repository-specific image storage and markdown image reference rules for posts in this Astro blog. Use when adding, reviewing, renaming, moving, or normalizing cover images and inline images for files in `src/content/posts`, especially when deciding filenames under `public/post_imgs`, frontmatter `image` values, and Markdown `![alt](/post_imgs/...)` references.
---

# Blog Post Images

Read `references/image-rules.md` before adding or renaming images.

## Workflow

1. Derive the post slug from the markdown filename.
2. Store every post image in `public/post_imgs/`.
3. Name cover and inline images with the post slug as the prefix.
4. Reference images from markdown with a root-relative `/post_imgs/...` path.

## Rules

- Put cover images in frontmatter `image:` and prefer a local file such as `/post_imgs/post-slug.png`.
- Put inline screenshots and diagrams in `public/post_imgs/` and reference them with standard Markdown image syntax.
- Use lowercase ASCII filenames with hyphens.
- Use descriptive alt text. Do not leave alt text empty unless the image is purely decorative and the user asked for that.
- Keep images on their own block with a blank line before and after.
- Do not use relative paths like `./image.png` or `../public/...`.
- Do not move post images into `src/assets/`.

## Naming Guide

- Cover image: `post-slug.ext`
- Sequential walkthrough images: `post-slug-01.ext`, `post-slug-02.ext`
- Topic-specific images: `post-slug-login.ext`, `post-slug-settings.ext`

## Existing Content Caveat

- Some existing posts still use remote cover images. Do not rewrite them unless the task includes image normalization.
- For new posts and newly-added images, follow the local `public/post_imgs/` rule.
- If the task also changes article structure or frontmatter, use `blog-post-format` together with this skill.

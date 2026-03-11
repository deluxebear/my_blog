# Image Rules

## Storage

- Store all blog images in `public/post_imgs/`.
- Do not place post images in `src/assets/` or next to the markdown file.
- Use lowercase ASCII filenames with hyphens.

## Naming

- Cover image: `post-slug.ext`
- Inline images: `post-slug-topic.ext` or `post-slug-01.ext`, `post-slug-02.ext` for ordered walkthroughs.
- Reuse the markdown filename slug as the prefix for every image related to that post.

Examples:

- `src/content/posts/etag.md` -> `/post_imgs/etag.png`
- `src/content/posts/giffgaff-esim-activation-guide.md` -> `/post_imgs/giffgaff-esim-activation-guide-01.png`

## Referencing from markdown

- Always reference images from the site root with `/post_imgs/...`.
- Use standard Markdown image syntax: `![alt text](/post_imgs/file.png)`.
- Write alt text that describes the screenshot or diagram briefly and concretely.
- Put images on their own line with a blank line before and after.

## Cover image rule

- New posts should use a local cover image path in frontmatter.
- If an existing post uses a remote `image:` URL, do not silently replace it unless the task includes adding or normalizing assets.

## Inline image rule

- Prefer local screenshots and diagrams over remote hotlinked images.
- When adding multiple screenshots for one tutorial, keep the filenames sequential or semantically grouped.
- Avoid duplicate filenames that could collide across posts.

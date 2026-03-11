## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.

### Available skills
- blog-post-format: Repository-specific rules for writing or revising posts in `src/content/posts`. Use when drafting, editing, reviewing, or normalizing blog markdown in this Astro blog, especially when frontmatter, heading structure, code fences, lists, or article section layout must match the existing project conventions. (file: /Users/xiongyanlin/projects/my_blog/skills/blog-post-format/SKILL.md)
- blog-post-images: Repository-specific rules for blog image storage and markdown references. Use when adding, renaming, moving, reviewing, or normalizing cover images and inline images for posts in this Astro blog, especially when deciding where files live under `public/post_imgs` and how they should be referenced from markdown. (file: /Users/xiongyanlin/projects/my_blog/skills/blog-post-images/SKILL.md)

### How to use skills
- Discovery: The list above is the skills available in this repository context.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1. After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2. When `SKILL.md` references relative paths, resolve them relative to the skill directory first.
  3. If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request.
- Context hygiene:
  - Keep context small and only load the parts of a skill that are needed for the current post task.
  - Prefer the repository skill over general markdown advice when the two conflict.

import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const allPostModules = import.meta.glob('../content/posts/*.{md,mdx}', { eager: true });
  const posts = Object.values(allPostModules) as any[];
  
  return rss({
    title: '数字花园',
    description: '探索web开发与创意编程的数字花园',
    site: context.site || 'http://localhost:4321',
    items: posts
      .map(post => ({
        title: post.frontmatter.title,
        description: post.frontmatter.description,
        pubDate: new Date(post.frontmatter.pubDate),
        link: `/posts/${post.file.split('/').pop()?.replace(/\.mdx?$/, '')}`,
      }))
      .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()),
    customData: `<language>zh-CN</language>`,
  });
};
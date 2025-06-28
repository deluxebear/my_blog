export const GET = async ({ request }) => {
  // 获取所有文章
  const posts = await import.meta.glob('../../content/posts/*.{md,mdx}', { eager: true });
  
  const searchData = Object.entries(posts).map(([path, post]) => ({
    title: post.frontmatter?.title || '',
    description: post.frontmatter?.description || '',
    slug: path.split('/').pop()?.replace(/\.mdx?$/, '') || '',
    tags: post.frontmatter?.tags || [],
    content: post.rawContent?.() || post.body || ''
  }));

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
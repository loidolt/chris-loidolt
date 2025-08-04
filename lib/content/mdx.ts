import { bundleMDX } from 'mdx-bundler';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrismPlus from 'rehype-prism-plus';

export async function processMDX(source: string, files: Record<string, string> = {}) {
  const { code, frontmatter } = await bundleMDX({
    source,
    files,
    mdxOptions(options) {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        rehypePrismPlus,
      ];
      return options;
    },
  });

  return { code, frontmatter };
}
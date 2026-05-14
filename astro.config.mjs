// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
	site: 'https://berkkirik.github.io',
	integrations: [sitemap()],
	markdown: {
		rehypePlugins: [
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					behavior: 'append',
					properties: {
						class: 'anchor-link',
						'aria-label': 'Link to this heading',
					},
					content: { type: 'text', value: '#' },
				},
			],
		],
	},
});

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config.ts';

export async function GET(context) {
	const posts = (await getCollection('blog', (p) => !p.data.draft)).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	return rss({
		title: `${SITE.title} — blog`,
		description: SITE.description,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description ?? '',
			pubDate: post.data.pubDate,
			link: `/blog/${post.id}/`,
			categories: post.data.tags,
		})),
	});
}

/**
 * Single source of truth for personal info shown across the site.
 * Edit this file to update your name, bio, nav links, and socials.
 */

export const SITE = {
	title: 'Berk Kırık',
	brand: 'berk@kirik:~$',
	author: 'Berk Kırık',
	description:
		'Senior AI Engineer building production ML systems — LLM fine-tuning, RAG, NER, agentic AI, and ML infrastructure on Kubernetes.',
	url: 'https://berkkirik.github.io',
	// Path to the resume PDF inside /public.
	resumePath: '/berk_kirik_cv.pdf',
} as const;

export const NAV: ReadonlyArray<{ href: string; label: string }> = [
	{ href: '/', label: 'about' },
	{ href: '/projects/', label: 'projects' },
	{ href: '/blog/', label: 'blog' },
	{ href: '/resume/', label: 'resume' },
];

export const SOCIALS: ReadonlyArray<{
	label: string;
	href: string;
	external?: boolean;
}> = [
	{ label: 'github', href: 'https://github.com/Berkkirik', external: true },
	{ label: 'linkedin', href: 'https://www.linkedin.com/in/berkkirik/', external: true },
	{ label: 'orcid', href: 'https://orcid.org/0009-0004-5045-3048', external: true },
	{ label: 'email', href: 'mailto:berk.kirik@outlook.com' },
	{ label: 'rss', href: '/rss.xml' },
];

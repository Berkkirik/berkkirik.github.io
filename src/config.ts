/**
 * Single source of truth for personal info shown across the site.
 * Edit this file to update your name, bio, nav links, and socials.
 */

export const SITE = {
	title: 'berk kirik',
	brand: 'berk@kirik:~$',
	author: 'Berk Kirik',
	description:
		'Personal site of Berk Kirik — software engineer. Projects, writing, and resume.',
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
	{ label: 'github', href: 'https://github.com/berkkirik', external: true },
	{ label: 'linkedin', href: 'https://www.linkedin.com/in/berkkirik', external: true },
	{ label: 'email', href: 'mailto:hello@example.com' },
	{ label: 'rss', href: '/rss.xml' },
];

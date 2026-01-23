export function getIdFromSlug(slug: string): string | null {
	const parts = slug.split("-");
	return parts[0] || null;
}

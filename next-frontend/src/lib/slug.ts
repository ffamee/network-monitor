export function getIdFromSlug(slug: string): string | null {
	const parts = slug.split("-");
	if (parts.length < 2) {
		// Invalid slug format
		return null;
	}
	return parts[0] || null;
}

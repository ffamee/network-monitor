import { test, expect } from "@playwright/test";

test.describe("test building page", () => {
	test("Building Image Carousel displays control button", async ({ page }) => {
		await page.goto("/dashboard/1");
		const ImageCarousel = page.getByTestId("building-image-carousel");
		await expect(ImageCarousel).toBeVisible();
		await ImageCarousel.focus();
		const previous = ImageCarousel.getByTestId(
			"building-image-carousel-previous"
		);
		const next = ImageCarousel.getByTestId("building-image-carousel-next");
		if ((await previous.isVisible()) && (await next.isVisible())) {
			await expect(previous).toBeEnabled();
			await expect(next).toBeEnabled();
		} else {
			await ImageCarousel.hover();
			await expect(previous).toBeVisible();
			await expect(next).toBeVisible();
			await expect(previous).toBeEnabled();
			await expect(next).toBeEnabled();
		}
	});
});

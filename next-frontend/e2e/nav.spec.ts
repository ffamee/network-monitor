import { test, expect } from "@playwright/test";

test.describe("test navigation", () => {
	test("Home page navigation Link", async ({ page }) => {
		await page.goto("/");
		const link = page.getByRole("link", { name: "Go to About Page" });
		await expect(link).toBeVisible();
		await link.click();
		await expect(page).toHaveURL("/about");
		await expect(page.getByRole("heading", { name: "About Us" })).toBeVisible();
		await expect(page.getByText("Welcome to the About Us page.")).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Go back to Home" })
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Go back to Home" })
		).toBeEnabled();
		const button = page.getByRole("button", { name: "Disabled" });
		await expect(button).toBeVisible();
		await expect(button).toBeDisabled();
	});

	test("About page navigation Link", async ({ page }) => {
		await page.goto("/about");
		const link = page.getByRole("link", { name: "Go back to Home" });
		await expect(link).toBeVisible();
		await link.click();
		await expect(page).toHaveURL("/");
		await expect(
			page.getByRole("link", { name: "Go to About Page" })
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Go to About Page" })
		).toBeEnabled();
		await page.goBack();
		await expect(page).toHaveURL("/about");
	});
});

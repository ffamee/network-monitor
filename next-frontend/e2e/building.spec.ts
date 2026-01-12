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

	test("Building Check Edit Modal Open", async ({ page }) => {
		const buildingSlug = "building-1";
		await page.goto("/dashboard/" + buildingSlug);
		const nav = page.getByRole("navigation");
		await expect(nav).toBeVisible();
		const editBuildingInfoTrigger = page.getByTestId(
			"edit-building-info-trigger"
		);
		await expect(editBuildingInfoTrigger).toBeVisible();
		await editBuildingInfoTrigger.click();
		const editBuildingForm = page.getByTestId("edit-building-form");
		await expect(editBuildingForm).toBeVisible();
		await expect(page).toHaveURL(`/edit/building/${buildingSlug}`);
		const CloseButton = page.getByRole("button", { name: "×" });
		await expect(CloseButton).toBeVisible();
		await CloseButton.click();
		await expect(page).toHaveURL(`/dashboard/${buildingSlug}`);
		await expect(editBuildingForm).toBeHidden();
		await expect(nav).toBeVisible();
	});

	test("Building Edit Modal Close on Outside Click", async ({ page }) => {
		const buildingSlug = "building-1";
		await page.goto("/dashboard/" + buildingSlug);
		const editBuildingInfoTrigger = page.getByTestId(
			"edit-building-info-trigger"
		);
		await expect(editBuildingInfoTrigger).toBeVisible();
		await editBuildingInfoTrigger.click();
		const editBuildingForm = page.getByTestId("edit-building-form");
		await expect(editBuildingForm).toBeVisible();
		await expect(page).toHaveURL(`/edit/building/${buildingSlug}`);
		await page.mouse.click(5, 5); // Click outside the modal
		await expect(page).toHaveURL(`/dashboard/${buildingSlug}`);
		await expect(editBuildingForm).toBeHidden();
	});

	test("Building Edit Modal Reload", async ({ page }) => {
		const buildingSlug = "building-1";
		await page.goto("/dashboard/" + buildingSlug);
		const editBuildingInfoTrigger = page.getByTestId(
			"edit-building-info-trigger"
		);
		const name = page.getByText("ProbeMon");
		await expect(name).toBeVisible();
		await expect(editBuildingInfoTrigger).toBeVisible();
		await editBuildingInfoTrigger.click();
		const editBuildingForm = page.getByTestId("edit-building-form");
		await expect(editBuildingForm).toBeVisible();
		await expect(page).toHaveURL(`/edit/building/${buildingSlug}`);
		await page.reload();
		await expect(page).toHaveURL(`/edit/building/${buildingSlug}`);
		await expect(editBuildingForm).toBeVisible();
		await expect(name).toBeHidden();
	});

	test("Building Edit Modal Submit Form", async ({ page, request }) => {
		// wait 1-3 seconds to avoid collision
		await page.waitForTimeout(Math.floor(Math.random() * 2000) + 1000);
		const ts = Date.now().toString();
		const buildingSlug = "building-" + ts;

		// Create a building to edit
		const createResponse = await request.post(
			"http://localhost:8000/building",
			{
				data: {
					slug: buildingSlug,
				},
			}
		);
		expect(createResponse.ok()).toBeTruthy();

		await page.goto("/dashboard/" + buildingSlug);
		const editBuildingInfoTrigger = page.getByTestId(
			"edit-building-info-trigger"
		);
		await expect(editBuildingInfoTrigger).toBeVisible();
		await editBuildingInfoTrigger.click();
		const editBuildingForm = page.getByTestId("edit-building-form");
		await expect(editBuildingForm).toBeVisible();
		const nameInput = page.getByLabel("Name");
		await expect(nameInput).toBeVisible();
		await expect(nameInput).toHaveValue(
			"อาคารนวัตกรรมดิจิทัล (Digital Innovation Tower)"
		);
		const newName = "Building " + ts;
		await nameInput.fill(newName);
		const submitButton = page.getByRole("button", { name: "Save Changes" });
		await expect(submitButton).toBeVisible();
		await submitButton.click();
		await expect(editBuildingForm).toBeHidden();
		const name = page.getByText(newName);
		await expect(name).toHaveCount(2);
		await expect(name.first()).toBeVisible();
		await expect(name.last()).toBeVisible();
		await expect(page).toHaveURL(`/dashboard/${buildingSlug}`);
	});
});

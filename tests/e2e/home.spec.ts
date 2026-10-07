import { expect, test } from "@playwright/test";

test("loads the homepage workspace and runs a search", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("searchbox", { name: "Search Google" })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("searchbox", { name: "Search Google" }).fill("nextjs zustand");
  await page.getByRole("button", { name: "Search", exact: true }).click();

  await expect(page).toHaveURL(/google\.com\/search/);
});

test("opens customize sheet", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Customize appearance" })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Customize appearance" }).click();
  await expect(page.getByRole("heading", { name: "Homepage" })).toBeVisible();
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
});

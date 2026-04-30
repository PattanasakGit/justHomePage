import { expect, test } from "@playwright/test";

test("loads the homepage workspace and runs a search", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "justHomePage" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Search the web" }).fill("nextjs zustand");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL(/google\.com\/search/);
});

test("opens settings and changes background", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Open settings" }).click();
  await page.getByRole("button", { name: "Aurora background" }).click();

  await expect(page.locator("body")).toHaveClass(/theme-aurora/);
});

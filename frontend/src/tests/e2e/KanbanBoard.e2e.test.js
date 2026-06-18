import { test, expect } from "@playwright/test";

test("User can add, move, and delete a task", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Real-time Kanban Board")).toBeVisible();

  await page.fill("#title", "Playwright task");
  await page.fill("#description", "Verify create and move actions.");
  await page.selectOption("#priority", "High");
  await page.selectOption("#category", "Feature");
  await page.click("button:has-text(\"Create task\")");

  await expect(page.getByText("Playwright task")).toBeVisible();

  const moveButton = page.getByRole("button", { name: /Move to In Progress/i });
  await expect(moveButton).toBeVisible();
  await moveButton.click();

  await expect(page.getByTestId("column-in-progress")).toContainText("Playwright task");

  const deleteButton = page.getByRole("button", { name: /Delete/i });
  await deleteButton.click();

  await expect(page.locator("text=Playwright task")).toHaveCount(0);
});

import { test, expect } from "@playwright/test";

// End-to-end smoke test of the core learning journey (spec §23 acceptance).
// Runs against `npm run dev` (see playwright.config.ts webServer).

test("core journey: onboard → lesson → XP → persist", async ({ page }) => {
  await page.goto("/onboarding");

  // Step 1: name
  await page.getByPlaceholder("e.g. Alex").fill("Testy");
  await page.getByRole("button", { name: "Next" }).click();
  // Step 2: time (default selected) → Next
  await page.getByRole("button", { name: "Next" }).click();
  // Step 3: goal → start diagnostic
  await page.getByRole("button", { name: /diagnostic/i }).click();

  // Diagnostic: answer all questions (pick first option, check, advance)
  await expect(page.getByText(/Diagnostic placement/i)).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: /^A/ }).first().click();
    await page.getByRole("button", { name: "Check answer" }).click();
    const next = page.getByRole("button", { name: /Next|See results/ });
    await next.click();
  }
  await page.getByRole("button", { name: /dashboard/i }).click();

  // Dashboard loaded
  await expect(page.getByText(/Welcome back, Testy/i)).toBeVisible();

  // Go to a known foundational lesson and complete it
  await page.goto("/lesson/L1-retrieval");
  await expect(page.getByText("Active Recall & Retrieval Practice")).toBeVisible();
  await page.getByRole("button", { name: /Start exercises/i }).click();

  // Answer the first MCQ (correct option is the first)
  await page.getByText(/effort of reconstructing a memory/i).click();
  await page.getByRole("button", { name: "Check" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Fill-blank
  const blanks = page.locator("input");
  await blanks.nth(0).fill("fluency");
  await blanks.nth(1).fill("recall");
  await page.getByRole("button", { name: "Check" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Explain (open response)
  await page.getByPlaceholder(/your answer/i).fill(
    "Re-reading only feels familiar; instead quiz yourself from memory for example with flashcards.",
  );
  await page.getByRole("button", { name: /Submit answer/i }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Summary → complete
  await page.getByRole("button", { name: /Complete lesson/i }).click();
  await expect(page.getByText(/Lesson complete/i)).toBeVisible();
  await expect(page.getByText(/XP earned/i)).toBeVisible();

  // Persistence: reload and confirm profile + progress survived
  await page.goto("/dashboard");
  await expect(page.getByText(/Welcome back, Testy/i)).toBeVisible();
  // XP should be > 0 now (level chip present)
  await expect(page.getByText(/Total XP/i)).toBeVisible();
});

import { test, expect, type Page } from '@playwright/test';

const SECTION_SELECTOR = '[id^="section-"]';

async function getVisibleSectionOrder(page: Page): Promise<string[]> {
  return page.locator(SECTION_SELECTOR).evaluateAll((sections) =>
    sections
      .filter((section) => {
        const style = window.getComputedStyle(section);
        const box = section.getBoundingClientRect();

        return (
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          box.width > 0 &&
          box.height > 0
        );
      })
      .map((section) => section.id)
      .filter((id) => typeof id === 'string' && id.length > 0)
  );
}

test('e2e test 1 -  add text section', async ({ page }) => {
  test.setTimeout(120_000);
  await test.step('Login to the site dashboard', async () => {
    await page.goto('https://uat.diy.gowhere.gov.sg/home', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'How to identify' })).toBeVisible();

    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('img', { name: 'Wise Logo | Powered By Govtech' })).toBeVisible();

    await page.getByTestId('text-input').fill('test_arga@gowhere.gov.sg');
    await page.getByRole('button', { name: 'Log in with Email' }).click();
    await expect(page.getByRole('heading', { name: 'Site dashboard' })).toBeVisible();
  });
//   await page.getByRole('link', { name: 'Arga first test' }).click();

  await test.step('Navigate to the builder of the test site', async () => { 
    await expect(page.getByRole('link', { name: "Arga's test 2" })).toBeVisible({ timeout: 30000 });
    await page.getByRole('link', { name: "Arga's test 2" }).click();
  });
  
  await test.step('Open the builder and verify the canvas is visible', async () => {
    const rejectApprovalButton = page.getByRole('button', { name: 'Reject approval' });
    if (await rejectApprovalButton.isVisible().catch(() => false)) {
      await rejectApprovalButton.click();
    }

    const buildingBlocksTab = page.getByRole('tab', { name: 'Building blocks' }).first();
    if ((await buildingBlocksTab.getAttribute('aria-selected')) !== 'true') {
      await buildingBlocksTab.click({ force: true });
    }

    await expect(page.locator('#preview-wrapper')).toBeVisible();
    await expect(page.locator('[id^="section-"]').first()).toBeVisible();
  });

  await test.step('Add a Text section from the section insert control', async () => {
    const insertButtonIndex = 0;
    const expectedInsertedIndex = insertButtonIndex + 1;
    const beforeOrder = await getVisibleSectionOrder(page);
    const beforeIds = new Set(beforeOrder);

    const addSectionButton = page
      .getByTestId('button-with-icon')
      .filter({ hasText: 'Add section' })
      .nth(insertButtonIndex);

    await expect(addSectionButton).toBeVisible({ timeout: 30000 });
    await addSectionButton.scrollIntoViewIfNeeded();
    await addSectionButton.evaluate((button: HTMLElement) => button.click());

    await expect(
      page.getByText('Choose a section or drag a block into this space.', { exact: true })
    ).toBeVisible({ timeout: 30000 });

    await page.locator('div:has(> div > p:text-is("Text")) > button').first().click();

    const afterOrder = await test.step('Wait for a new section to appear', async () => {
      await expect
        .poll(async () => getVisibleSectionOrder(page), {
          message: 'Expected adding Text from the insert menu to create a visible section.',
          timeout: 30000,
        })
        .toHaveLength(beforeOrder.length + 1);

      return getVisibleSectionOrder(page);
    });

    const newSectionId = afterOrder.find((id) => !beforeIds.has(id));
    expect(newSectionId, 'Expected to find the newly inserted section ID.').toBeTruthy();

    const newSectionIndex = afterOrder.indexOf(newSectionId!);
    expect(
      newSectionIndex,
      'Expected the new Text section to be inserted at the requested index.'
    ).toBe(expectedInsertedIndex);

    const newSection = page.locator(`${SECTION_SELECTOR}#${newSectionId}`);
    await expect(newSection).toBeVisible();
    await expect(newSection.locator('[id^="heading-"], [id^="text-"]').first()).toBeVisible();

    await expect(page.getByText('Saved', { exact: true })).toBeVisible({ timeout: 30000 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#preview-wrapper')).toBeVisible({ timeout: 30000 });

    await expect
      .poll(async () => getVisibleSectionOrder(page), {
        message: 'Expected the added Text section to persist after reload.',
        timeout: 30000,
      })
      .toHaveLength(beforeOrder.length + 1);

    await expect(page.locator(`${SECTION_SELECTOR}#${newSectionId}`)).toBeVisible();
  });

//   await page.getByTitle('Text').first().click();
//   await page.getByTitle('Text').first().click();
//   await page.goto('https://uat.diy.gowhere.gov.sg/login');




});

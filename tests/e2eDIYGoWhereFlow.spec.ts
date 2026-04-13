import { test, expect } from '@playwright/test';
import {
  dragPaletteBlockBeforeIndex,
  expectSectionToContainTextContent,
  getSectionOrder,
} from '../utils/builderDrag';

test('e2e test 1 -  add text section', async ({ page }) => {
  await page.goto('https://uat.diy.gowhere.gov.sg/home');
  await expect(page.getByRole('button', { name: 'How to identify' })).toBeVisible();

  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('img', { name: 'Wise Logo | Powered By Govtech' })).toBeVisible();

  await page.getByTestId('text-input').fill('test_arga@gowhere.gov.sg');
  await page.getByRole('button', { name: 'Log in with Email' }).click();
  await expect(page.getByRole('heading', { name: 'Start a new site' })).toBeVisible();

//   await page.getByRole('link', { name: 'Arga first test' }).click();
  await page.getByRole('link', { name: "Arga's test 2" }).click();

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

  await test.step('Drag a Text block into the builder canvas', async () => {
    const targetSectionIndex = 1;

    const beforeOrder = await getSectionOrder(page);
    const beforeIds = new Set(beforeOrder);
    const expectedInsertedIndex = targetSectionIndex;

    await dragPaletteBlockBeforeIndex(page, 'Text', targetSectionIndex);

    const afterOrder = await test.step('Wait for a new section to appear', async () => {
      await expect
        .poll(async () => getSectionOrder(page), {
          message: 'Expected dragging Text from the palette to create a new section.',
          timeout: 10000,
        })
        .toHaveLength(beforeOrder.length + 1);

      return getSectionOrder(page);
    });

    const newSectionId = afterOrder.find((id) => !beforeIds.has(id));
    expect(newSectionId, 'Expected to find the newly inserted section ID.').toBeTruthy();

    const newSectionIndex = afterOrder.indexOf(newSectionId!);
    expect(
      newSectionIndex,
      'Expected the new Text section to be inserted at the requested index.'
    ).toBe(expectedInsertedIndex);

    await expectSectionToContainTextContent(page, newSectionId!);
  });

//   await page.getByTitle('Text').first().click();
//   await page.getByTitle('Text').first().click();
//   await page.goto('https://uat.diy.gowhere.gov.sg/login');




});


import { test, expect } from '@playwright/test';

test('e2e test 2 - send for approval > upgrade to publish', async ({ page }) => {
  await page.goto('https://uat.diy.gowhere.gov.sg/home');
  await expect(page.getByRole('button', { name: 'How to identify' })).toBeVisible();

  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('img', { name: 'Wise Logo | Powered By Govtech' })).toBeVisible();

  await page.getByTestId('text-input').fill('test_arga@gowhere.gov.sg');
  await page.getByRole('button', { name: 'Log in with Email' }).click();
  await expect(page.getByRole('heading', { name: 'Start a new site' })).toBeVisible();

  await page.getByRole('link', { name: 'Blank site' }).click();
  await expect(page.getByRole('heading', { name: 'Setting up your site' })).toBeVisible();

  // create draft site
  await page.getByTestId('form-textarea').click();
  await page.getByTestId('form-textarea').fill('Arga test seven');
  await page.locator('label').filter({ hasText: 'Fuji Apple' }).click();
  await page.getByRole('button', { name: 'Create website' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Building blocks' })).toBeVisible();

  // send for approval
  await page.getByTitle('Send for approval').click();
  await expect(page.getByRole('heading', { name: 'Send for approval (Trial)' })).toBeVisible();
  await page.getByTestId('form-textarea').fill('test seven');
  await page.getByTestId('button').nth(2).click();

  // upgrade to publish
  await page.locator('button').filter({ hasText: 'Upgrade to publish' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Pages' })).toBeVisible();

  await page.getByTestId('form-textarea').click();
  await page.getByTestId('form-textarea').fill('test seven arga');
  await page.getByRole('button', { name: 'Request upgrade' }).click();
  await expect(page.getByRole('heading', { name: 'Upgrade request submitted!' })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();


  await page.getByTestId('test-button').click();
  await page.locator('[id="headlessui-popover-button-:r1o:"]').click();
  await page.locator('[id="headlessui-popover-button-:r15:"]').click();
  // await expect(page.getByRole('button', { name: 'Upgrade plan Upgrade to' })).toBeVisible();

  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('link', { name: 'Arga test seven' })).toBeVisible();
  await page.getByRole('link', { name: 'Arga test seven' }).click();
  await expect(page.getByRole('link', { name: 'Arga test seven' })).toBeVisible();
  await expect(page.getByText('Pending request').nth(1)).toBeVisible();
});
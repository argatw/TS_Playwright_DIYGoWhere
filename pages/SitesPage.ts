import { expect, type Page } from '@playwright/test';

export class SitesPage {
  constructor(private readonly page: Page) {}

  siteDraftLink(siteName: string) {
    return this.page.getByRole('link', { name: siteName });
  }

  async openSiteDraft(siteName: string) {
    const siteLink = this.siteDraftLink(siteName);

    await expect(siteLink).toBeVisible({ timeout: 30000 });
    await siteLink.click();
  }
}

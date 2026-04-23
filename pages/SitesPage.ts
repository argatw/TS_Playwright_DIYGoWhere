import { expect, type Page } from '@playwright/test';

const sitesPageLocators = {
  createWebsiteButtonName: 'Create website',
  formTextareaTestId: 'form-textarea',
  postLoginLandingHeadingName: /^(Site dashboard|Start a new site)$/,
  siteDashboardHeadingName: 'Site dashboard',
  siteSetupHeadingName: 'Setting up your site',
  startNewSiteHeadingName: 'Start a new site',
} as const;

export class SitesPage {
  constructor(private readonly page: Page) {}

  get startNewSiteHeading() {
    return this.page.getByRole('heading', { name: sitesPageLocators.startNewSiteHeadingName });
  }

  get siteDashboardHeading() {
    return this.page.getByRole('heading', { name: sitesPageLocators.siteDashboardHeadingName });
  }

  get siteSetupHeading() {
    return this.page.getByRole('heading', { name: sitesPageLocators.siteSetupHeadingName });
  }

  get postLoginLandingHeading() {
    return this.page.getByRole('heading', { name: sitesPageLocators.postLoginLandingHeadingName }).first();
  }

  get siteNameInput() {
    return this.page.getByTestId(sitesPageLocators.formTextareaTestId);
  }

  get createWebsiteButton() {
    return this.page.getByRole('button', { name: sitesPageLocators.createWebsiteButtonName });
  }

  blankSiteLink(templateName: string) {
    return this.page.getByRole('link', { name: templateName });
  }

  siteDraftLink(siteName: string) {
    return this.page.getByRole('link', { name: siteName });
  }

  themeOption(themeName: string) {
    return this.page.locator('label').filter({ hasText: themeName });
  }

  async expectStartNewSiteVisible() {
    await expect(this.startNewSiteHeading).toBeVisible({ timeout: 30000 });
  }

  async expectPostLoginLandingVisible() {
    await expect(this.postLoginLandingHeading).toBeVisible({
      timeout: 30000,
    });
  }

  async chooseBlankSiteTemplate(templateName: string) {
    await this.blankSiteLink(templateName).click();
    await expect(this.siteSetupHeading).toBeVisible({ timeout: 30000 });
  }

  async createDraftSite(siteName: string, themeName: string) {
    await this.siteNameInput.fill(siteName);
    await this.themeOption(themeName).click();
    await this.createWebsiteButton.click();
  }

  async openSiteDraft(siteName: string) {
    const siteLink = this.siteDraftLink(siteName);

    await expect(siteLink).toBeVisible({ timeout: 30000 });
    await siteLink.click();
  }
}

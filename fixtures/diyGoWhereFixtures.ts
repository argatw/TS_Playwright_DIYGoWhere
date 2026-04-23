import { test as base, expect } from '@playwright/test';
import { BuilderPage } from '../pages/BuilderPage';
import { LoginPage } from '../pages/LoginPage';
import { SitesPage } from '../pages/SitesPage';
import { AuthTestData } from '../test-data/AuthTestData';
import { SiteBuilderTestData } from '../test-data/SiteBuilderTestData';

type DiyGoWhereFixtures = {
  builderPage: BuilderPage;
  loginPage: LoginPage;
  sitesPage: SitesPage;
  openDraftBuilder: () => Promise<void>;
};

export const test = base.extend<DiyGoWhereFixtures>({
  builderPage: async ({ page }, use) => {
    await use(new BuilderPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  sitesPage: async ({ page }, use) => {
    await use(new SitesPage(page));
  },

  openDraftBuilder: async ({ builderPage, loginPage, sitesPage }, use) => {
    await use(async () => {
      await loginPage.goto(AuthTestData.homeUrl);
      await loginPage.loginWithEmail(AuthTestData.email);
      await sitesPage.expectPostLoginLandingVisible();
      await sitesPage.openSiteDraft(SiteBuilderTestData.draftSiteName);
      await builderPage.openBuildingBlocksCanvas();
    });
  },
});

export { expect };

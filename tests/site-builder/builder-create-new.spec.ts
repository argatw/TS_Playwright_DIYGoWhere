import { test } from '../../fixtures/diyGoWhereFixtures';
import { AuthTestData } from '../../test-data/AuthTestData';
import { SiteBuilderTestData } from '../../test-data/SiteBuilderTestData';

test('@builder @p1 @new builder create new draft site - blank site opens in builder', async ({
  builderPage,
  loginPage,
  sitesPage,
}) => {
  test.setTimeout(120_000);

  const draftSiteName = `${SiteBuilderTestData.newDraftSiteNamePrefix} ${Date.now()}`;

  await test.step('Login to the site dashboard', async () => {
    await loginPage.goto(AuthTestData.homeUrl);
    await loginPage.loginWithEmail(AuthTestData.email);
    await sitesPage.expectPostLoginLandingVisible();
  });

  await test.step('Choose the Blank site template', async () => {
    await sitesPage.expectStartNewSiteVisible();
    await sitesPage.chooseBlankSiteTemplate(SiteBuilderTestData.blankSiteTemplateName);
  });

  await test.step('Create a new draft site', async () => {
    await sitesPage.createDraftSite(draftSiteName, SiteBuilderTestData.draftThemeName);
  });

  await test.step('Verify the new draft opens in the builder', async () => {
    await builderPage.openBuildingBlocksCanvas();
  });
});

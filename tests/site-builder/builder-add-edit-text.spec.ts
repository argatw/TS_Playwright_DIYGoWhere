import { test } from '../../fixtures/diyGoWhereFixtures';
import { BuilderSectionTypes } from '../../test-data/BuilderSectionTypes';
import { SiteBuilderTestData } from '../../test-data/SiteBuilderTestData';

test('@builder @p0 @text @add builder add and edit text section - edited content persists after reload', async ({
  builderPage,
  openDraftBuilder,
}) => {
  test.setTimeout(120_000);

  const uniqueSuffix = Date.now();
  const uniqueHeading = `POM edited heading ${uniqueSuffix}`;
  const uniqueBody = `POM edited body ${uniqueSuffix}`;
  let textSectionId = '';

  await test.step('Open the draft site builder', async () => {
    await openDraftBuilder();
  });

  await test.step('Add a Text section using the insert menu', async () => {
    textSectionId = await builderPage.addSectionFromInsertMenu(
      BuilderSectionTypes.text,
      SiteBuilderTestData.targetSectionIndex
    );
  });

  await test.step('Edit the Text section heading and body', async () => {
    await builderPage.editTextSection(textSectionId, uniqueHeading, uniqueBody);
  });

  await test.step('Reload and verify edited text persists', async () => {
    await builderPage.reloadBuilder();
    await builderPage.expectTextVisible(uniqueHeading);
    await builderPage.expectTextVisible(uniqueBody);
  });
});

import { test } from '../../fixtures/diyGoWhereFixtures';
import { BuilderSectionTypes } from '../../test-data/BuilderSectionTypes';
import { SiteBuilderTestData } from '../../test-data/SiteBuilderTestData';

test('@builder @p0 @remove builder remove section - removed section stays removed after reload', async ({
  builderPage,
  openDraftBuilder,
}) => {
  test.setTimeout(120_000);

  let textSectionId = '';

  await test.step('Open the draft site builder', async () => {
    await openDraftBuilder();
  });

  await test.step('Add a Text section to remove', async () => {
    textSectionId = await builderPage.addSectionFromInsertMenu(
      BuilderSectionTypes.text,
      SiteBuilderTestData.targetSectionIndex
    );
  });

  await test.step('Remove the newly added section', async () => {
    await builderPage.removeSection(textSectionId);
  });

  await test.step('Reload and verify the section stays removed', async () => {
    await builderPage.expectSectionRemovedAfterReload(textSectionId);
  });
});

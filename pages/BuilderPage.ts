import { expect, type Locator, type Page } from '@playwright/test';

const builderPageLocators = {
  addSectionButton: 'button[data-testid="button-with-icon"]:visible',
  addSectionButtonText: 'Add section',
  buildingBlocksTabName: 'Building blocks',
  craftContainer: '[id^="container-"].craft-block-container[type="container"]',
  directCraftDragHandle: ':scope > .sc-gGzvRR[draggable="true"]',
  headingBlock: '[id^="heading-"]',
  insertMenuInstruction: 'Choose a section or drag a block into this space.',
  previewWrapper: '#preview-wrapper',
  rejectApprovalButtonName: 'Reject approval',
  savedStatusText: 'Saved',
  sectionTileButton: (sectionType: string) =>
    `div:has(> div > p:text-is("${sectionType}")) > button`,
  savingStatusText: 'Saving',
  savingOrSavedStatusText: /^(Saving|Saved)$/,
  section: '[id^="section-"]',
  selectedSectionDeleteButton: 'button[aria-label="Delete"]:visible',
  textBlock: '[id^="text-"]',
  textContentBlock: '[id^="heading-"], [id^="text-"]',
  visibleStatusText: 'p:visible',
} as const;

export class BuilderPage {
  constructor(private readonly page: Page) {}

  get previewWrapper() {
    return this.page.locator(builderPageLocators.previewWrapper);
  }

  get visibleSections() {
    return this.page.locator(builderPageLocators.section);
  }

  sectionById(sectionId: string) {
    return this.page.locator(`${builderPageLocators.section}#${sectionId}`);
  }

  async openBuildingBlocksCanvas() {
    const rejectApprovalButton = this.page.getByRole('button', {
      name: builderPageLocators.rejectApprovalButtonName,
    });
    if (await rejectApprovalButton.isVisible().catch(() => false)) {
      await rejectApprovalButton.click();
    }

    const buildingBlocksTab = this.page
      .getByRole('tab', { name: builderPageLocators.buildingBlocksTabName })
      .first();
    if ((await buildingBlocksTab.getAttribute('aria-selected')) !== 'true') {
      await buildingBlocksTab.click({ force: true });
    }

    await expect(this.previewWrapper).toBeVisible({ timeout: 30000 });
    await expect(this.visibleSections.first()).toBeVisible({ timeout: 30000 });
  }

  async getVisibleSectionOrder(): Promise<string[]> {
    return this.visibleSections.evaluateAll((sections) =>
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

  async addSectionFromInsertMenu(sectionType: string, insertButtonIndex = 0): Promise<string> {
    const expectedInsertedIndex = insertButtonIndex + 1;
    const beforeOrder = await this.getVisibleSectionOrder();
    const beforeIds = new Set(beforeOrder);

    const addSectionButton = this.page
      .locator(builderPageLocators.addSectionButton)
      .filter({ hasText: builderPageLocators.addSectionButtonText })
      .nth(insertButtonIndex);
    await expect(addSectionButton).toBeVisible({ timeout: 8000 });
    await addSectionButton.scrollIntoViewIfNeeded();
    // The canvas insert control can be covered by builder overlays, so use a DOM click after visibility.
    await addSectionButton.evaluate((button: HTMLElement) => button.click());

    await expect(
      this.page.getByText(builderPageLocators.insertMenuInstruction, { exact: true })
    ).toBeVisible({ timeout: 30000 });

    await this.sectionTile(sectionType).click();

    await expect
      .poll(async () => this.getVisibleSectionOrder(), {
        message: `Expected adding ${sectionType} from the insert menu to create a visible section.`,
        timeout: 30000,
      })
      .toHaveLength(beforeOrder.length + 1);

    const afterOrder = await this.getVisibleSectionOrder();
    const newSectionId = afterOrder.find((id) => !beforeIds.has(id));
    expect(newSectionId, 'Expected to find the newly inserted section ID.').toBeTruthy();

    const newSectionIndex = afterOrder.indexOf(newSectionId!);
    expect(
      newSectionIndex,
      `Expected the new ${sectionType} section to be inserted at the requested index.`
    ).toBe(expectedInsertedIndex);

    const newSection = this.sectionById(newSectionId!);
    await expect(newSection).toBeVisible();
    await expect(newSection.locator(builderPageLocators.textContentBlock).first()).toBeVisible();
    await this.waitForSaved();

    return newSectionId!;
  }

  async editTextSection(sectionId: string, heading: string, body: string) {
    const section = this.sectionById(sectionId);
    await expect(section).toBeVisible({ timeout: 30000 });

    await this.replaceInlineText(this.headingBlock(section), heading);
    await this.commitInlineEdit();
    await this.replaceInlineText(this.textBlock(section), body);
    await this.commitInlineEdit();
    await this.waitForSaved();
  }

  async selectSection(sectionId: string) {
    const selectableContainer = this.sectionSelectableContainer(sectionId);
    await expect(selectableContainer).toBeVisible({ timeout: 30000 });
    await selectableContainer.scrollIntoViewIfNeeded();

    // Craft.js marks the inner container as selected only when its direct drag handle is clicked.
    // The selected state exposes the floating toolbar used by section-level actions like Delete.
    const dragHandle = selectableContainer.locator(builderPageLocators.directCraftDragHandle).first();
    if (await dragHandle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dragHandle.click({ force: true });
    } else {
      await selectableContainer.click({ force: true });
    }

    await expect(selectableContainer).toHaveClass(/selected/, { timeout: 30000 });
    await expect(this.selectedSectionDeleteButton).toBeVisible({ timeout: 30000 });
  }

  async removeSection(sectionId: string) {
    await this.selectSection(sectionId);

    // Prefer the visible selected-section toolbar action; fall back to the keyboard shortcut only
    // if the toolbar click does not remove the selected Craft block.
    const toolbarDeleteSaveCycle = this.waitForAutosaveCycle({ timeout: 10000 }).catch(() => undefined);
    await this.selectedSectionDeleteButton.click();
    if (await this.waitForSectionToDisappear(sectionId, 5000)) {
      await toolbarDeleteSaveCycle;
      await this.waitForSaved();
      return;
    }

    await this.selectSection(sectionId);
    const keyboardDeleteSaveCycle = this.waitForAutosaveCycle({ timeout: 10000 }).catch(() => undefined);
    await this.page.keyboard.press('Delete');

    await this.expectSectionToDisappear(sectionId);
    await keyboardDeleteSaveCycle;
    await this.waitForSaved();
  }

  async expectSectionRemovedAfterReload(sectionId: string) {
    await this.reloadBuilder();
    await expect
      .poll(async () => this.getVisibleSectionOrder(), {
        message: `Expected removed section ${sectionId} to stay removed after reload.`,
        timeout: 30000,
      })
      .not.toContain(sectionId);
  }

  async reloadBuilder() {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(this.previewWrapper).toBeVisible({ timeout: 30000 });
  }

  async expectTextVisible(text: string) {
    await expect(this.page.getByText(text, { exact: true })).toBeVisible({ timeout: 30000 });
  }

  async waitForSaved() {
    await expect(this.saveStatus).toHaveText(builderPageLocators.savedStatusText, {
      timeout: 30000,
    });
  }

  private get selectedSectionDeleteButton() {
    return this.page.locator(builderPageLocators.selectedSectionDeleteButton).last();
  }

  private get saveStatus() {
    return this.page
      .locator(builderPageLocators.visibleStatusText)
      .filter({ hasText: builderPageLocators.savingOrSavedStatusText })
      .first();
  }

  private sectionTile(sectionType: string) {
    return this.page.locator(builderPageLocators.sectionTileButton(sectionType)).first();
  }

  private sectionSelectableContainer(sectionId: string) {
    return this.sectionById(sectionId)
      .locator(builderPageLocators.craftContainer)
      .first();
  }

  private headingBlock(section: Locator) {
    return section.locator(builderPageLocators.headingBlock).first();
  }

  private textBlock(section: Locator) {
    return section.locator(builderPageLocators.textBlock).first();
  }

  private async replaceInlineText(locator: Locator, value: string) {
    await expect(locator).toBeVisible({ timeout: 30000 });
    await locator.scrollIntoViewIfNeeded();
    await locator.click({ force: true });
    await this.page.keyboard.press('ControlOrMeta+A');
    await this.page.keyboard.insertText(value);
    await expect(locator).toContainText(value, { timeout: 30000 });
  }

  private async commitInlineEdit() {
    await this.page.keyboard.press('Tab');
    await this.waitForAutosaveCycle({ timeout: 5000 });
  }

  private async waitForAutosaveCycle({ timeout }: { timeout: number }) {
    // "Saving" is transient, so callers may tolerate missing it while still requiring final "Saved".
    await expect(this.saveStatus).toHaveText(builderPageLocators.savingStatusText, { timeout });
    await this.waitForSaved();
  }

  private async expectSectionToDisappear(sectionId: string) {
    await expect
      .poll(async () => this.getVisibleSectionOrder(), {
        message: `Expected section ${sectionId} to be removed from the builder.`,
        timeout: 30000,
      })
      .not.toContain(sectionId);
  }

  private async waitForSectionToDisappear(sectionId: string, timeout: number) {
    return expect
      .poll(async () => this.getVisibleSectionOrder(), { timeout })
      .not.toContain(sectionId)
      .then(
        () => true,
        () => false
      );
  }
}

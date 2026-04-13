import { expect, type Locator, type Page } from '@playwright/test';

const SECTION_SELECTOR = '[id^="section-"]';
const INSERTION_LINE_SELECTOR =
  'div[style*="position: fixed"][style*="height: 2px"]';

type DropPosition = 'before' | 'after';

function sectionLocator(page: Page, sectionId: string): Locator {
  return page.locator(`${SECTION_SELECTOR}#${sectionId}`);
}

function paletteBlockLocator(page: Page, blockTitle: string): Locator {
  return page.locator(`button[title="${blockTitle}"][draggable="true"]`).first();
}

function sectionByIndexLocator(page: Page, index: number): Locator {
  return page.locator(SECTION_SELECTOR).nth(index);
}

async function getSectionBox(section: Locator) {
  await expect(section).toBeVisible();

  const box = await section.boundingBox();
  if (!box) {
    throw new Error('Could not resolve section bounding box.');
  }

  return box;
}

async function getDragHandleBox(sourceSection: Locator) {
  const handle = sourceSection.locator('div[draggable="true"]').first();
  await expect(handle).toBeVisible();

  const box = await handle.boundingBox();
  if (!box) {
    throw new Error('Could not resolve drag handle bounding box.');
  }

  return box;
}

async function dragSectionToPosition(
  page: Page,
  sourceHandle: Locator,
  targetSection: Locator,
  position: DropPosition
) {
  await expect(sourceHandle).toBeVisible();
  await targetSection.scrollIntoViewIfNeeded();

  const sourceBox = await sourceHandle.boundingBox();
  if (!sourceBox) {
    throw new Error('Could not resolve source bounding box.');
  }
  const targetBox = await getSectionBox(targetSection);

  const startX = sourceBox.x + sourceBox.width / 2;
  const startY = sourceBox.y + sourceBox.height / 2;
  const targetX = targetBox.x + targetBox.width / 2;
  const hoverY = targetBox.y + targetBox.height / 2;
  const targetY =
    position === 'before'
      ? Math.max(targetBox.y - 6, 0)
      : targetBox.y + targetBox.height - Math.min(8, targetBox.height / 4);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(targetX, hoverY, { steps: 12 });
  await page.mouse.move(targetX, targetY, { steps: 12 });

  const insertionLine = page.locator(INSERTION_LINE_SELECTOR).last();
  const insertionVisible = await insertionLine
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);

  if (insertionVisible) {
    const lineBox = await insertionLine.boundingBox();
    if (lineBox) {
      await page.mouse.move(
        lineBox.x + lineBox.width / 2,
        lineBox.y + lineBox.height / 2,
        { steps: 8 }
      );
    }
  }

  await page.waitForTimeout(120);

  await page.mouse.up();
}

export async function dragSectionBefore(
  page: Page,
  sourceSectionId: string,
  targetSectionId: string
) {
  const sourceSection = sectionLocator(page, sourceSectionId);
  const targetSection = sectionLocator(page, targetSectionId);
  const sourceHandle = sourceSection.locator('div[draggable="true"]').first();

  await dragSectionToPosition(page, sourceHandle, targetSection, 'before');
}

export async function dragSectionAfter(
  page: Page,
  sourceSectionId: string,
  targetSectionId: string
) {
  const sourceSection = sectionLocator(page, sourceSectionId);
  const targetSection = sectionLocator(page, targetSectionId);
  const sourceHandle = sourceSection.locator('div[draggable="true"]').first();

  await dragSectionToPosition(page, sourceHandle, targetSection, 'after');
}

export async function dragPaletteBlockBefore(
  page: Page,
  blockTitle: string,
  targetSectionId: string
) {
  const sourceHandle = paletteBlockLocator(page, blockTitle);
  const targetSection = sectionLocator(page, targetSectionId);

  await dragSectionToPosition(page, sourceHandle, targetSection, 'before');
}

export async function dragPaletteBlockBeforeIndex(
  page: Page,
  blockTitle: string,
  targetSectionIndex: number
) {
  const sourceHandle = paletteBlockLocator(page, blockTitle);
  const targetSection = sectionByIndexLocator(page, targetSectionIndex);

  await dragSectionToPosition(page, sourceHandle, targetSection, 'before');
}

export async function dragPaletteBlockAfterIndex(
  page: Page,
  blockTitle: string,
  targetSectionIndex: number
) {
  const sourceHandle = paletteBlockLocator(page, blockTitle);
  const targetSection = sectionByIndexLocator(page, targetSectionIndex);

  await dragSectionToPosition(page, sourceHandle, targetSection, 'after');
}

export async function getSectionOrder(page: Page): Promise<string[]> {
  return page.locator(SECTION_SELECTOR).evaluateAll((sections) =>
    sections
      .map((section) => section.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  );
}

export async function expectSectionOrder(
  page: Page,
  expectedOrder: string[]
) {
  await expect
    .poll(async () => getSectionOrder(page), {
      message: 'Expected the section order in the builder to update.',
    })
    .toEqual(expectedOrder);
}

export async function expectSectionToContainTextContent(
  page: Page,
  sectionId: string
) {
  const section = sectionLocator(page, sectionId);
  await expect(section).toBeVisible();

  const textLikeNode = section.locator(
    '[id^="heading-"], [id^="text-"], [type="component"]'
  ).first();
  await expect(textLikeNode).toBeVisible();
}

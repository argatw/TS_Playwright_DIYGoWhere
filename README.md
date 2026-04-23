# DIYGoWhere Site Builder Test Automation Suite

## Overview

This repository contains a Playwright + TypeScript test automation suite for the DIYGoWhere site builder.

The assessment brief only required enough coverage to demonstrate test design thinking and technical automation skill, not exhaustive coverage of every builder component. I therefore focused on a small set of representative builder workflows and implemented them in a reusable Page Object Model structure.

The suite targets the site builder flow itself and keeps the setup/login flow lightweight.

## Scope and Approach

I selected a focused set of test cases to demonstrate:

- reusable Page Object Model design
- centralized page-level locator management
- shared fixtures for common setup
- separated test data for maintainability
- representative builder coverage for create, add/edit, and remove flows

Rather than building a brittle full matrix of every section type, I prioritized a few stronger end-to-end builder scenarios that prove meaningful behavior.

## Implemented Test Coverage

The main maintained specs are under `tests/site-builder/`.

### 1. `builder-create-new.spec.ts`

Purpose:
- login
- choose Blank site
- create a new draft site
- verify the draft opens in the builder

This covers the supporting setup path into the builder.

### 2. `builder-add-edit-text.spec.ts`

Purpose:
- open an existing draft site
- add a Text section
- edit heading and body with unique content
- wait for autosave
- reload
- verify edited content persists

This is the highest-value builder test case because it demonstrates add, edit, save, and reload persistence in one flow.

### 3. `builder-remove-section.spec.ts`

Purpose:
- open an existing draft site
- add a Text section
- remove the newly added section
- reload
- verify the removed section stays removed

This demonstrates section-level deletion and persistence after reload.

## Framework Structure

```text
fixtures/
  diyGoWhereFixtures.ts

pages/
  LoginPage.ts
  SitesPage.ts
  BuilderPage.ts

test-data/
  AuthTestData.ts
  BuilderSectionTypes.ts
  SiteBuilderTestData.ts

tests/
  site-builder/
    builder-create-new.spec.ts
    builder-add-edit-text.spec.ts
    builder-remove-section.spec.ts
```

## Design Notes

### Page Object Model

The suite uses a POM structure so that:

- specs stay readable and focused on intent
- selectors and page interactions stay within page classes
- future builder coverage can scale without duplicating raw locator logic

### Fixtures

`fixtures/diyGoWhereFixtures.ts` provides shared typed fixtures such as:

- `loginPage`
- `sitesPage`
- `builderPage`
- `openDraftBuilder()`

This keeps repeated setup logic out of the specs.

### Test Data Separation

Test data is separated from page logic:

- `AuthTestData.ts` stores login URL and account information
- `SiteBuilderTestData.ts` stores draft names, theme, and target builder section index
- `BuilderSectionTypes.ts` stores supported builder section labels

This makes the suite easier to update when test inputs change.

### Builder State Handling

The builder is a live autosaving UI. Assertions therefore use two layers:

- behavior validation through section identity or edited text
- synchronization through builder save status before reload

For example, section IDs are used to prove that a section was added or removed, while the `Saved` status is used as a timing guard before reloading the page.

### Extendability

The current `BuilderPage` was intentionally shaped around reusable builder actions rather than one-off test steps.

In particular:

- `addSectionFromInsertMenu()` provides a reusable entry point for adding different section types through the same builder flow
- `removeSection()` provides a reusable section-level delete flow once a section ID is known
- `editTextSection()` demonstrates how section-specific editing behavior can sit on top of the shared add/select/save building blocks

This means additional coverage can be layered on later with relatively small new specs, for example:

- add/edit image section flows
- add/edit carousel flows
- add/edit image-and-text or text-and-image flows
- columns-focused editing flows

The suite therefore aims to demonstrate not only current coverage, but also a maintainable path to expanding coverage across more builder section families.

### Stable Insert Position

The current suite externalizes the target insert position through:

- `SiteBuilderTestData.targetSectionIndex`

This was added to make the test more maintainable when the first visible insert slot is unstable or behaves differently from other insert points.

## Why Only These Tests

The builder offers many possible section types, especially image-based layouts. Instead of trying to automate every variant under assessment time constraints, I prioritized a smaller set of test cases that better demonstrate framework quality and automation judgment.

The chosen tests show:

- clean setup into the builder
- meaningful add/edit persistence coverage
- section removal coverage
- reusable builder actions that can be extended to other section types
- a structure that can be extended to more section families later

## Constraints and Tradeoffs

- The suite targets a live UAT environment rather than a fully controlled local app.
- The tests use one shared account and shared draft content, so Playwright is configured with `workers: 1` and `fullyParallel: false`.
- I intentionally did not try to exhaustively automate every builder component because that would add a lot of brittleness for limited additional signal in this assessment.
- The UAT environment is dependent on whitelist access and showed intermittent availability during the assessment period, so the framework was designed to stay focused and maintainable rather than overfitted to unstable UI behavior.

## Prerequisites

- Node.js installed
- npm installed
- Playwright browsers installed
- access to the DIYGoWhere UAT environment
- active whitelisted IP access for the provided login account

Install dependencies:

```bash
npm install
```

Install Playwright browsers if needed:

```bash
npx playwright install
```

## How to Run

Run all tests:

```bash
npm run test:e2e
```

Run headed:

```bash
npm run test:e2e:headed
```

Run the maintained builder specs only:

```bash
npx playwright test tests/site-builder
```

Run individual specs:

```bash
npx playwright test tests/site-builder/builder-create-new.spec.ts
npx playwright test tests/site-builder/builder-add-edit-text.spec.ts
npx playwright test tests/site-builder/builder-remove-section.spec.ts
```

## Reports

The Playwright HTML report is enabled in `playwright.config.ts`.

After a run, open the report with:

```bash
npx playwright show-report
```

## Notes for Review

- The main assessment-ready work is under `tests/site-builder/`, `pages/`, `fixtures/`, and `test-data/`.
- Legacy exploratory specs may still exist in the repository, but the maintained framework and focused builder coverage are represented by the `tests/site-builder/` folder.
- The current solution is intended to demonstrate sound automation design, maintainability, and extensibility rather than exhaustive builder UI coverage.

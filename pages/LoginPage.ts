import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  get howToIdentifyButton() {
    return this.page.getByRole('button', { name: 'How to identify' });
  }

  get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
  }

  get wiseLogo() {
    return this.page.getByRole('img', { name: 'Wise Logo | Powered By Govtech' });
  }

  get emailInput() {
    return this.page.getByTestId('text-input');
  }

  get loginWithEmailButton() {
    return this.page.getByRole('button', { name: 'Log in with Email' });
  }

  get siteDashboardHeading() {
    return this.page.getByRole('heading', { name: 'Site dashboard' });
  }

  async goto(homeUrl: string) {
    await this.page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
    await expect(this.howToIdentifyButton).toBeVisible();
  }

  async loginWithEmail(email: string) {
    await this.loginButton.click();
    await expect(this.wiseLogo).toBeVisible();

    await this.emailInput.fill(email);
    await this.loginWithEmailButton.click();
    await expect(this.siteDashboardHeading).toBeVisible();
  }
}

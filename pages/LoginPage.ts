import { expect, type Page } from '@playwright/test';

const loginPageLocators = {
  emailInputTestId: 'text-input',
  howToIdentifyButtonName: 'How to identify',
  loginButtonName: 'Login',
  loginWithEmailButtonName: 'Log in with Email',
  wiseLogoName: 'Wise Logo | Powered By Govtech',
} as const;

export class LoginPage {
  constructor(private readonly page: Page) {}

  get howToIdentifyButton() {
    return this.page.getByRole('button', { name: loginPageLocators.howToIdentifyButtonName });
  }

  get loginButton() {
    return this.page.getByRole('button', { name: loginPageLocators.loginButtonName });
  }

  get wiseLogo() {
    return this.page.getByRole('img', { name: loginPageLocators.wiseLogoName });
  }

  get emailInput() {
    return this.page.getByTestId(loginPageLocators.emailInputTestId);
  }

  get loginWithEmailButton() {
    return this.page.getByRole('button', { name: loginPageLocators.loginWithEmailButtonName });
  }

  async goto(homeUrl: string) {
    await this.page.goto(homeUrl, { waitUntil: 'domcontentloaded' });
    await expect(this.howToIdentifyButton).toBeVisible();
  }

  async loginWithEmail(email: string) {
    await this.loginButton.click();
    await expect(this.emailInput).toBeVisible({ timeout: 30000 });

    await this.emailInput.fill(email);
    await this.loginWithEmailButton.click();
  }
}

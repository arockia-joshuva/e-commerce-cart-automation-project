import { expect, Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.dismissStartupOverlays();
    await expect(this.page).toHaveURL(/amazon\.in/);
  }

  async login(email: string, password: string, loginTimeoutMs: number): Promise<void> {
    await this.goto();

    const accountTrigger = this.page.locator('#nav-link-accountList');
    await accountTrigger.click();

    await this.completeEmailStepIfPresent(email);
    await this.completePasswordStep(password);
    await this.page.locator('#signInSubmit').click();

    await this.waitForPostLoginState(loginTimeoutMs);
    await this.dismissStartupOverlays();
  }

  async searchFor(product: string): Promise<void> {
    const searchBox = this.page.locator('#twotabsearchtextbox');
    await searchBox.fill(product);
    await searchBox.press('Enter');
  }

  private async completeEmailStepIfPresent(email: string): Promise<void> {
    const emailInput = this.page
      .locator('input#ap_email:not([type="hidden"]), input[name="email"]:not([type="hidden"]), input[type="email"]')
      .first();
    const passwordInput = this.page.locator('input[type="password"]').first();
    const otpInput = this.page.locator('input[name="otpCode"], input#cvf-input-code').first();

    await Promise.race([
      emailInput.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined),
      passwordInput.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined),
      otpInput.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => undefined),
    ]);

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill(email);
      await this.page.locator('#continue').click();
    }
  }

  private async completePasswordStep(password: string): Promise<void> {
    const usePasswordLink = this.page
      .getByRole('link', { name: /sign in with your password|use password|password/i })
      .or(this.page.getByRole('button', { name: /sign in with your password|use password|password/i }))
      .first();

    if (await usePasswordLink.isVisible().catch(() => false)) {
      await usePasswordLink.click();
    }

    const passwordInput = this.page.locator('input[type="password"]:visible').first();
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);
  }

  private async waitForPostLoginState(loginTimeoutMs: number): Promise<void> {
    const signedInIndicator = this.page.locator('#nav-link-accountList-nav-line-1');
    const searchBox = this.page.locator('#twotabsearchtextbox');
    const cartLink = this.page.locator('#nav-cart');
    const otpInput = this.page.locator('input[name="otpCode"], input#cvf-input-code');
    const captchaInput = this.page.locator('input[name="cvf_captcha_input"], input#captchacharacters');

    await Promise.race([
      signedInIndicator.waitFor({ state: 'visible', timeout: loginTimeoutMs }),
      searchBox.waitFor({ state: 'visible', timeout: loginTimeoutMs }),
      cartLink.waitFor({ state: 'visible', timeout: loginTimeoutMs }),
      this.page.waitForURL(/amazon\.in/, { timeout: loginTimeoutMs }),
      otpInput.waitFor({ state: 'visible', timeout: loginTimeoutMs }).then(() => {
        throw new Error(
          'Amazon is waiting for OTP verification. Complete it in the browser, then re-run or switch to a saved authenticated session.',
        );
      }),
      captchaInput.waitFor({ state: 'visible', timeout: loginTimeoutMs }).then(() => {
        throw new Error(
          'Amazon is showing a CAPTCHA challenge. Complete it in the browser, then re-run or switch to a saved authenticated session.',
        );
      }),
    ]);

    const searchBoxVisible = await searchBox.isVisible().catch(() => false);
    const cartLinkVisible = await cartLink.isVisible().catch(() => false);

    if (!searchBoxVisible && !cartLinkVisible) {
      throw new Error('Login did not reach a stable signed-in Amazon page within the configured timeout.');
    }
  }

  private async dismissStartupOverlays(): Promise<void> {
    const continueShopping = this.page.getByRole('button', { name: /continue shopping/i });
    if (await continueShopping.isVisible().catch(() => false)) {
      await continueShopping.click();
    }
  }
}

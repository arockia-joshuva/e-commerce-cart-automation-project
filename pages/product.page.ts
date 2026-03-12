import { expect, Page } from '@playwright/test';
import { parsePrice } from '../utils/currency';

export class ProductPage {
  constructor(private readonly page: Page) {}

  async waitForLoaded(): Promise<void> {
    await expect(this.page.locator('span#productTitle').first()).toBeVisible();
  }

  async getProductTitle(): Promise<string> {
    const title = ((await this.page.locator('span#productTitle').first().textContent()) || '').trim();
    if (!title) {
      throw new Error('Product detail page did not expose a readable product title.');
    }
    return title;
  }

  async captureDisplayedPrice(): Promise<number> {
    const priceSelectors = [
      '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen',
      '#corePrice_feature_div .a-price .a-offscreen',
      '.apexPriceToPay .a-offscreen',
      '#corePriceDisplay_desktop_feature_div .a-price-whole',
      '#corePrice_feature_div .a-price-whole',
      '.apexPriceToPay .a-price-whole',
      'span.a-price.aok-align-center .a-offscreen',
      'span.a-price .a-offscreen',
    ];

    for (const selector of priceSelectors) {
      const locator = this.page.locator(selector);
      const count = await locator.count();

      for (let index = 0; index < count; index += 1) {
        const candidate = locator.nth(index);
        const rawText = (await candidate.textContent())?.trim() || '';

        if (!rawText || !/[₹\d]/.test(rawText)) {
          continue;
        }

        try {
          return parsePrice(rawText);
        } catch {
          // Ignore non-price fragments and continue scanning.
        }
      }
    }

    throw new Error('Unable to capture a valid product price from the product detail page.');
  }

  async addToCart(): Promise<void> {
    const addToCartButton = await this.findVisibleAddToCartButton();
    const initialCartCount = await this.getCartCount();

    await addToCartButton.scrollIntoViewIfNeeded();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    const sideSheetCart = this.page.getByRole('button', { name: /go to cart/i });
    if (await sideSheetCart.isVisible().catch(() => false)) {
      await sideSheetCart.click();
      return;
    }

    await expect
      .poll(async () => this.getCartCount(), {
        message: 'Cart count should increase after adding the product to cart.',
        timeout: 30_000,
      })
      .toBeGreaterThan(initialCartCount);

    await this.page.locator('#attach-cart-info-spinner, .a-spinner-wrapper').first().waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => undefined);
    await this.page.goto('/gp/cart/view.html?ref_=nav_cart', { waitUntil: 'domcontentloaded' });
  }

  private async findVisibleAddToCartButton() {
    const candidates = [
      this.page.locator('#add-to-cart-button').first(),
      this.page.locator('#addToCart_feature_div input[type="submit"]').first(),
      this.page.locator('#desktop_qualifiedBuyBox').getByRole('button', { name: /add to cart/i }).first(),
      this.page.locator('#buyBoxAccordion').getByRole('button', { name: /add to cart/i }).first(),
      this.page.locator('#rightCol').getByRole('button', { name: /add to cart/i }).first(),
      this.page.getByRole('button', { name: /^add to cart$/i }).first(),
    ];

    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }

    throw new Error('Unable to find a visible Add to cart button on the product detail page.');
  }

  private async getCartCount(): Promise<number> {
    const rawCount =
      ((await this.page.locator('#nav-cart-count').textContent().catch(() => '')) || '').trim() ||
      ((await this.page.locator('#nav-cart').getAttribute('aria-label').catch(() => '')) || '').trim();
    const match = rawCount.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
}

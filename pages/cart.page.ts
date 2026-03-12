import { expect, Locator, Page } from '@playwright/test';
import { parsePrice } from '../utils/currency';

export class CartPage {
  constructor(private readonly page: Page) {}

  async clearCart(): Promise<void> {
    await this.page.goto('/gp/cart/view.html?ref_=nav_cart', { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2_000).catch(() => undefined);

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const deleteControl = await this.findVisibleDeleteControl();
      if (deleteControl) {
        await deleteControl.click();
        await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
        await this.page.waitForTimeout(2_000).catch(() => undefined);
        continue;
      }

      const quantityZeroApplied = await this.trySetFirstItemQuantityToZero();
      if (quantityZeroApplied) {
        await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
        await this.page.waitForTimeout(2_000).catch(() => undefined);
        continue;
      }

      const cartItems = this.cartItems();
      if (!(await cartItems.first().isVisible().catch(() => false))) {
        break;
      }
    }
  }

  async verifyItemPresent(productMatchText?: string): Promise<void> {
    await expect(this.visibleCartItem(productMatchText)).toBeVisible();
  }

  async getUnitPrice(productMatchText?: string): Promise<number> {
    const item = this.visibleCartItem(productMatchText);
    const priceLocator = item
      .locator('.sc-product-price')
      .or(item.locator('.a-price .a-offscreen'))
      .first();

    await expect(priceLocator).toBeVisible();
    return parsePrice(await priceLocator.innerText());
  }

  async getSubtotal(): Promise<number> {
    const subtotalLocator = this.page
      .locator('#sc-subtotal-amount-activecart')
      .or(this.page.locator('#sc-subtotal-amount-buybox'))
      .or(this.page.locator('[data-name="Subtotals"] .a-price .a-offscreen'))
      .first();

    await expect(subtotalLocator).toBeVisible();
    return parsePrice(await subtotalLocator.innerText());
  }

  async setQuantity(productMatchText: string | undefined, quantity: number): Promise<boolean> {
    const item = this.visibleCartItem(productMatchText);
    const quantitySelect = item.locator('select[name^="quantity"]');

    if (await quantitySelect.count()) {
      const options = await quantitySelect.locator('option').allTextContents().catch(() => []);
      const hasQuantity = options.some((option) => option.trim() === quantity.toString());
      if (!hasQuantity) {
        return false;
      }

      await quantitySelect.selectOption(quantity.toString());
      return true;
    }

    if (quantity === 2) {
      const increaseButton = item.getByRole('button', { name: /increase quantity by one/i }).first();
      if (await increaseButton.isVisible().catch(() => false)) {
        const disabled =
          (await increaseButton.getAttribute('aria-disabled').catch(() => null)) === 'true' ||
          (await increaseButton.isDisabled().catch(() => false));
        if (disabled) {
          return false;
        }

        await increaseButton.click();
        return true;
      }
    }

    return false;
  }

  async enableGiftOption(productMatchText?: string): Promise<void> {
    const item = this.visibleCartItem(productMatchText);
    const pageLevelCheckbox = this.page.getByLabel(/this order contains a gift/i).first();
    if (await pageLevelCheckbox.isVisible().catch(() => false)) {
      await pageLevelCheckbox.setChecked(true, { force: true });
      return;
    }

    const checkbox = item.getByLabel(/this will be a gift/i).first();

    await checkbox.setChecked(true, { force: true });
  }

  async verifyGiftIndicator(): Promise<void> {
    const indicator = this.page.getByLabel(/this order contains a gift/i).or(this.page.getByText(/this order contains a gift/i)).first();
    await expect(indicator).toBeVisible();
  }

  private cartItems(productMatchText?: string): Locator {
    const items = this.page
      .locator(
        '#sc-active-cart [data-asin]:visible, #sc-active-cart .sc-list-item:visible, [data-name="Active Items"] [data-asin]:visible, [data-name="Active Items"] .sc-list-item:visible',
      )
      .filter({
        has: this.page.locator('button[aria-label^="Delete "], input[value="Delete"], .sc-action-delete input, h3'),
      });

    if (!productMatchText) {
      return items;
    }

    return items.filter({
      hasText: new RegExp(this.escapeRegExp(productMatchText), 'i'),
    });
  }

  private visibleCartItem(productMatchText?: string): Locator {
    return this.cartItems(productMatchText).first();
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async findVisibleDeleteControl(): Promise<Locator | null> {
    const candidates = [
      this.page.locator('input[value="Delete"]').first(),
      this.page.locator('[data-action="delete"] input').first(),
      this.page.locator('.sc-action-delete input').first(),
      this.page.getByRole('button', { name: /^delete$/i }).first(),
      this.page.getByRole('link', { name: /^delete$/i }).first(),
      this.page.getByText(/^Delete$/, { exact: true }).first(),
    ];

    for (const candidate of candidates) {
      if (await candidate.isVisible().catch(() => false)) {
        return candidate;
      }
    }

    return null;
  }

  private async trySetFirstItemQuantityToZero(): Promise<boolean> {
    const quantitySelect = this.page.locator('select[name^="quantity"]').first();
    if (await quantitySelect.isVisible().catch(() => false)) {
      const options = await quantitySelect.locator('option').allTextContents().catch(() => []);
      const zeroOption = options.find((option) => option.trim() === '0' || /delete/i.test(option));
      if (zeroOption) {
        await quantitySelect.selectOption({ label: zeroOption.trim() }).catch(async () => {
          await quantitySelect.selectOption('0').catch(() => undefined);
        });
        return true;
      }
    }

    return false;
  }
}

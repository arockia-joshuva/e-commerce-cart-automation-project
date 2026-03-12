import { expect, test } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { HomePage } from '../pages/home.page';
import { ProductPage } from '../pages/product.page';
import { SearchResultsPage } from '../pages/search-results.page';
import { formatPrice } from '../utils/currency';
import { getNumberEnv, requireEnv } from '../utils/env';

test.describe('Amazon.in cart automation', () => {
  test('logs in, adds product to cart, updates quantity, and verifies gift option', async ({ page }) => {
    test.slow();

    const email = requireEnv('AMAZON_EMAIL');
    const password = requireEnv('AMAZON_PASSWORD');
    const productQuery = process.env.AMAZON_PRODUCT_QUERY?.trim() || 'iPhone 17 Pro Max 256 GB: 17.42 cm (6.9")';
    const productMatch = process.env.AMAZON_PRODUCT_MATCH?.trim() || 'iPhone 17 Pro Max 256 GB';
    const loginTimeoutMs = getNumberEnv('AMAZON_LOGIN_TIMEOUT_MS', 120_000);

    const homePage = new HomePage(page);
    const searchResultsPage = new SearchResultsPage(page);
    const preSearchCartPage = new CartPage(page);

    await homePage.login(email, password, loginTimeoutMs);
    await preSearchCartPage.clearCart();
    await homePage.searchFor(productQuery);

    const selectedProduct = await searchResultsPage.openMatchingProduct(productMatch);
    console.log(selectedProduct.page.url());
    const productPage = new ProductPage(selectedProduct.page);
    const cartPage = new CartPage(selectedProduct.page);

    await productPage.waitForLoaded();
    await productPage.getProductTitle();
    const productPrice = await productPage.captureDisplayedPrice();
    await test.info().attach('product-price', {
      body: `Captured PDP price: ${formatPrice(productPrice)}`,
      contentType: 'text/plain',
    });

    await productPage.addToCart();

    await cartPage.verifyItemPresent();

    const cartUnitPrice = await cartPage.getUnitPrice();
    expect(cartUnitPrice).toBe(productPrice);

    const initialSubtotal = await cartPage.getSubtotal();
    expect(initialSubtotal).toBe(productPrice);

    const increasedQuantity = await cartPage.setQuantity(undefined, 2);
    if (increasedQuantity) {
      await expect
        .poll(async () => cartPage.getSubtotal(), {
          message: 'Cart subtotal should update after increasing quantity to 2',
        })
        .toBe(productPrice * 2);
    } else {
      await test.info().attach('quantity-limit', {
        body: 'Quantity 2 was not available in the cart, likely because only one unit was in stock.',
        contentType: 'text/plain',
      });
      await expect.poll(async () => cartPage.getSubtotal()).toBe(productPrice);
    }

    await cartPage.enableGiftOption();
    await cartPage.verifyGiftIndicator();
  });
});

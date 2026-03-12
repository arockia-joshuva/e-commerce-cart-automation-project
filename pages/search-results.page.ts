import { expect, Page } from '@playwright/test';

export type SelectedProduct = {
  page: Page;
  title: string;
};

export class SearchResultsPage {
  constructor(private readonly page: Page) {}

  async openMatchingProduct(productMatchText: string): Promise<SelectedProduct> {
    await expect(this.page).toHaveURL(/s\?/);
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page.getByRole('heading', { name: /results for/i }).first()).toBeVisible();
    const searchUrl = this.page.url();
    const candidates = await this.findCandidateProductLinks(productMatchText);

    for (const candidate of candidates) {
      const productUrl = new URL(candidate.href, this.page.url());
      productUrl.searchParams.delete('th');
      productUrl.searchParams.delete('psc');

      await this.page.goto(productUrl.toString(), { waitUntil: 'commit' });

      const productTitle = ((await this.page.locator('span#productTitle').first().textContent().catch(() => '')) || '').trim();
      if (!this.isBundleVariant(productTitle)) {
        return { page: this.page, title: candidate.title || productTitle };
      }

      await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      await this.page.waitForLoadState('domcontentloaded');
    }

    throw new Error(`All matched Amazon product pages resolved to bundle/service variants for "${productMatchText}".`);
  }

  private async findCandidateProductLinks(productMatchText: string): Promise<Array<{ href: string; title: string; score: number }>> {
    const links = this.page.locator('a[href*="/dp/"]');
    await expect
      .poll(async () => links.count(), {
        message: 'Amazon search results should expose product links before selection starts.',
      })
      .toBeGreaterThan(0);

    const linkCount = await links.count();

    if (!linkCount) {
      throw new Error('Amazon search results did not render any product links with headings.');
    }

    const queryTokens = this.tokenize(productMatchText);
    const candidates: Array<{ href: string; title: string; score: number }> = [];

    for (let index = 0; index < linkCount; index += 1) {
      const link = links.nth(index);
      const title = ((await link.textContent().catch(() => '')) || '').trim();
      const href = await link.getAttribute('href').catch(() => null);

      if (!title || !href) {
        continue;
      }

      const normalizedTitle = title.toLowerCase();
      let score = queryTokens.reduce((count, token) => count + Number(normalizedTitle.includes(token)), 0);

      if (/\bprotect\+?\b|\bapplecare\b|\bservices?\b|\bbundle\b/.test(normalizedTitle)) {
        score -= 5;
      }

      if (
        /\bcompatible\b|\btempered\b|\bglass\b|\bprotector\b|\bcase\b|\bcover\b|\bcharger\b|\badapter\b|\bcable\b|\bskin\b/.test(
          normalizedTitle,
        )
      ) {
        score -= 8;
      }

      if (!/\biphone\b/.test(normalizedTitle)) {
        score -= 5;
      }

      if (/\bpro\b/.test(normalizedTitle)) {
        score += 2;
      }

      if (/\bmax\b/.test(normalizedTitle)) {
        score += 3;
      }

      if (/\bair\b|\bmini\b|\bplus\b|\be\b/.test(normalizedTitle)) {
        score -= 4;
      }

      if (/\b256\s*gb\b/.test(normalizedTitle)) {
        score += 2;
      }

      if (/\b1\s*tb\b|\b512\s*gb\b/.test(normalizedTitle)) {
        score -= 2;
      }
      if (
        score > 0 &&
        /\biphone\b/.test(normalizedTitle) &&
        /\bpro\b/.test(normalizedTitle) &&
        /\bmax\b/.test(normalizedTitle) &&
        !/\bcompatible\b|\bprotector\b|\bcase\b|\bcover\b/.test(normalizedTitle)
      ) {
        candidates.push({ href, title, score });
      }
    }

    candidates.sort((left, right) => right.score - left.score);

    if (candidates.length) {
      return candidates.slice(0, 5);
    }

    throw new Error(`Unable to find a product result matching "${productMatchText}" with a usable Amazon product link.`);
  }

  private tokenize(value: string): string[] {
    return Array.from(
      new Set(
        value
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .map((token) => token.trim())
          .filter((token) => token.length >= 2),
      ),
    );
  }

  private isBundleVariant(title: string): boolean {
    return /\bprotect\+?\b|\bapplecare\b|\bservices?\b|\bbundle\b/i.test(title);
  }
}

import { Locator, Page } from '@playwright/test';

export class SearchPage {
    private readonly resultsHeading: Locator;
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with accessible names verified on the live search page
        this.resultsHeading = page.getByRole('heading', {
            name: 'Products meeting the search criteria',
            exact: true,
        });
    }

    /** Checks that the product search results page is displayed. */
    async isSearchResultsPageDisplayed(): Promise<boolean> {
        return this.resultsHeading.isVisible();
    }

    /** Checks that the requested product appears in the search results. */
    async isProductDisplayed(productName: string): Promise<boolean> {
        const productLink = this.page
            .getByRole('heading', { name: productName, exact: true })
            .getByRole('link', { name: productName, exact: true });
        if (!(await this.resultsHeading.isVisible())) {
            return false;
        }
        return productLink.isVisible();
    }

    /** Opens the requested product from the search results. */
    async openProduct(productName: string): Promise<void> {
        const productLink = this.page
            .getByRole('heading', { name: productName, exact: true })
            .getByRole('link', { name: productName, exact: true });
        await productLink.click();
    }
}
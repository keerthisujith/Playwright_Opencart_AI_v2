import { Locator, Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;
    private readonly accountMenu: Locator;
    private readonly registerLink: Locator;
    private readonly loginLink: Locator;
    private readonly searchInput: Locator;
    private readonly storeLogo: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with accessible names verified on the live storefront
        this.accountMenu = page.getByRole('link', { name: /My Account/ }).first();
        this.registerLink = page.getByRole('link', { name: 'Register', exact: true });
        this.loginLink = page.getByRole('link', { name: 'Login', exact: true });
        this.searchInput = page.getByRole('textbox', { name: 'Search' });
        this.storeLogo = page.getByRole('img', { name: 'Your Store' });
    }

    /**
     * Checks that the storefront is displayed.
     * @returns Promise<boolean> - true when the store logo is visible
     */
    async isStorefrontDisplayed(): Promise<boolean> {
        return this.storeLogo.isVisible();
    }

    /** Opens the customer registration page from the account menu. */
    async openRegisterPage(): Promise<void> {
        await this.accountMenu.click();
        await this.registerLink.last().click();
    }

    /** Opens the customer login page from the account menu. */
    async openLoginPage(): Promise<void> {
        await this.accountMenu.click();
        await this.loginLink.last().click();
    }

    /** Checks that logged-out account options are displayed in the account menu. */
    async isLoggedOutAccountMenuDisplayed(): Promise<boolean> {
        await this.accountMenu.click();
        return (await this.loginLink.last().isVisible()) && this.registerLink.last().isVisible();
    }

    /** Searches the catalog for a product. */
    async searchProduct(productName: string): Promise<void> {
        await this.searchInput.fill(productName);
        await this.searchInput.press('Enter');
    }
}
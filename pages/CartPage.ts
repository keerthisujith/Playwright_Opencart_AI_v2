import { Locator, Page } from '@playwright/test';

export class CartPage {
    private readonly page: Page;
    private readonly cartHeading: Locator;
    private readonly shoppingCartLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with accessible names verified on the live cart page
        this.cartHeading = page.getByRole('heading', { name: /Shopping Cart/ });
        this.shoppingCartLink = page.getByRole('link', { name: /shopping cart/i }).last();
    }

    /** Opens the shopping cart from the storefront navigation. */
    async openShoppingCart(): Promise<void> {
        await this.shoppingCartLink.click();
    }

    /** Checks that the shopping cart page is displayed. */
    async isCartDisplayed(): Promise<boolean> {
        return this.cartHeading.isVisible();
    }

    /** Returns the cart row for a product. */
    getProductRow(productName: string): Locator {
        return this.page.getByRole('row').filter({
            has: this.page.getByRole('link', { name: productName, exact: true }),
        });
    }

    /** Reads the quantity of a product in the cart. */
    async getProductQuantity(productName: string): Promise<string> {
        return this.getProductRow(productName).getByRole('textbox').inputValue();
    }

    /** Reads a product's unit price in the cart. */
    async getProductUnitPrice(productName: string): Promise<string> {
        return this.getProductRow(productName).getByRole('cell').nth(4).innerText();
    }

    /** Reads a product's line total in the cart. */
    async getProductLineTotal(productName: string): Promise<string> {
        return this.getProductRow(productName).getByRole('cell').nth(5).innerText();
    }

    /** Reads the final total in the cart summary. */
    async getCartTotal(): Promise<string> {
        const totalRow = this.page.getByRole('row').filter({
            has: this.page.getByText('Total:', { exact: true }),
        });
        return totalRow.getByRole('cell').nth(1).innerText();
    }
}
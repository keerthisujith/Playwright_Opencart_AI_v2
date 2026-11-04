import { Locator, Page } from '@playwright/test';

export class ProductPage {
    private readonly page: Page;
    private readonly quantityInput: Locator;
    private readonly addToCartButton: Locator;
    private readonly addToCartAlert: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with accessible names verified on the live product page
        this.quantityInput = page.getByRole('textbox', { name: 'Qty' });
        this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
        this.addToCartAlert = page.locator('.alert-success');
    }

    /** Checks that the requested product details page is displayed. */
    async isProductDisplayed(productName: string): Promise<boolean> {
        return this.page.getByRole('heading', { name: productName, exact: true }).isVisible();
    }

    /** Reads the quantity selected on the product page. */
    async getQuantity(): Promise<string> {
        return this.quantityInput.inputValue();
    }

    /** Sets the quantity selected on the product page. */
    async setQuantity(quantity: string): Promise<void> {
        await this.quantityInput.fill(quantity);
    }

    /** Adds the displayed product to the shopping cart. */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }

    /** Reads the success message displayed after adding the product to the cart. */
    async getAddToCartMessage(): Promise<string> {
        return this.addToCartAlert.innerText();
    }

}
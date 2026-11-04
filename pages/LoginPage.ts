import { Locator, Page } from '@playwright/test';

export class LoginPage {
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly loginWarning: Locator;
    private readonly loginPageHeading: Locator;

    constructor(page: Page) {
        // Initialize locators with accessible names verified on the live login form
        this.emailInput = page.getByRole('textbox', { name: 'E-Mail Address' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
        this.loginWarning = page.locator('.alert-danger');
        this.loginPageHeading = page.getByRole('heading', {
            name: 'Returning Customer',
            exact: true,
        });
    }

    /** Checks that the returning-customer login form is displayed. */
    async isLoginPageDisplayed(): Promise<boolean> {
        return this.loginPageHeading.isVisible();
    }

    /** Signs in with the supplied customer credentials. */
    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /**
     * Reads the warning displayed after an unsuccessful login.
     * @returns Promise<string> - the visible login warning
     */
    async getLoginWarning(): Promise<string> {
        return (await this.loginWarning.innerText()).trim();
    }
}
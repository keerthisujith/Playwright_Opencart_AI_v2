import { Locator, Page } from '@playwright/test';

export class AdminLoginPage {
    private readonly page: Page;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly securityNotificationClose: Locator;
    private readonly dashboardHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with accessible names verified in the Admin Portal
        this.usernameInput = page.getByRole('textbox', { name: 'Username' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.loginButton = page.getByRole('button', { name: /Login/ });
        this.securityNotificationClose = page.getByText('×', { exact: true });
        this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard', exact: true });
    }

    /** Opens the Admin Portal using the configured storefront URL. */
    async openAdminPortal(): Promise<void> {
        const webAppUrl = (process.env.WEB_APP_URL || 'http://localhost/opencart/upload/').replace(
            /\/?$/,
            '/',
        );
        await this.page.goto(new URL('admin/index.php', webAppUrl).toString());
    }

    /** Signs in with configured administrator credentials. */
    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    /** Dismisses the initial Admin Portal security notification when it is shown. */
    async dismissSecurityNotification(): Promise<void> {
        if (await this.securityNotificationClose.isVisible()) {
            await this.securityNotificationClose.click();
        }
    }

    /** Checks that the Admin Portal dashboard is displayed. */
    async isDashboardDisplayed(): Promise<boolean> {
        return this.dashboardHeading.isVisible();
    }
}
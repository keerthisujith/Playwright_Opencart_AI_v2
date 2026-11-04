import { Locator, Page } from '@playwright/test';

export class AccountPage {
    private readonly page: Page;
    private readonly registrationSuccessHeading: Locator;
    private readonly accountHeading: Locator;
    private readonly logoutHeading: Locator;
    private readonly logoutLink: Locator;
    private readonly myAccountLink: Locator;
    private readonly continueLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with headings and links verified on the live account pages
        this.registrationSuccessHeading = page.getByRole('heading', {
            name: 'Your Account Has Been Created!',
            exact: true,
        });
        this.accountHeading = page.getByRole('heading', { name: 'My Account', exact: true }).first();
        this.logoutHeading = page.getByRole('heading', { name: 'Account Logout', exact: true });
        this.logoutLink = page.getByRole('link', { name: 'Logout', exact: true });
        this.myAccountLink = page.getByRole('link', { name: 'My Account', exact: true }).last();
        this.continueLink = page.getByRole('link', { name: 'Continue', exact: true });
    }

    /** Checks that customer registration completed successfully. */
    async isRegistrationSuccessful(): Promise<boolean> {
        return this.registrationSuccessHeading.isVisible();
    }

    /** Opens the newly created customer's account from account navigation. */
    async openMyAccountPage(): Promise<void> {
        await this.myAccountLink.click();
    }

    /** Logs out the currently authenticated customer. */
    async logout(): Promise<void> {
        await this.logoutLink.click();
    }

    /** Continues to the storefront from the logout confirmation page. */
    async continueAfterLogout(): Promise<void> {
        await this.continueLink.click();
    }

    /** Checks that the customer account dashboard is displayed. */
    async isAccountPageDisplayed(): Promise<boolean> {
        return this.page.url().includes('route=account/account') && this.accountHeading.isVisible();
    }

    /** Checks that authenticated account navigation is available. */
    async isAuthenticatedNavigationDisplayed(): Promise<boolean> {
        return this.logoutLink.isVisible();
    }

    /** Checks that the logout confirmation page is displayed. */
    async isLoggedOut(): Promise<boolean> {
        return this.logoutHeading.isVisible();
    }
}
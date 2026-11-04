import { Locator, Page } from '@playwright/test';

export class RegisterPage {
    private readonly registrationHeading: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly emailInput: Locator;
    private readonly telephoneInput: Locator;
    private readonly passwordInput: Locator;
    private readonly passwordConfirmInput: Locator;
    private readonly privacyPolicyCheckbox: Locator;
    private readonly continueButton: Locator;

    constructor(page: Page) {
        // Initialize locators with placeholders and accessible controls verified on the live form
        this.registrationHeading = page.getByRole('heading', {
            name: 'Register Account',
            exact: true,
        });
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.emailInput = page.getByPlaceholder('E-Mail');
        this.telephoneInput = page.getByPlaceholder('Telephone');
        this.passwordInput = page.getByPlaceholder('Password', { exact: true });
        this.passwordConfirmInput = page.getByPlaceholder('Password Confirm');
        this.privacyPolicyCheckbox = page.getByRole('checkbox');
        this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
    }

    /** Checks that the customer registration page is displayed. */
    async isRegistrationPageDisplayed(): Promise<boolean> {
        await this.registrationHeading.waitFor({ state: 'visible' });
        return true;
    }

    /** Fills and submits the new customer registration form. */
    async register(
        firstName: string,
        lastName: string,
        email: string,
        telephone: string,
        password: string,
    ): Promise<void> {
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.emailInput.fill(email);
        await this.telephoneInput.fill(telephone);
        await this.passwordInput.fill(password);
        await this.passwordConfirmInput.fill(password);
        await this.privacyPolicyCheckbox.check();
        await this.continueButton.click();
    }
}
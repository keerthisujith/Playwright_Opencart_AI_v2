import { Locator, Page } from '@playwright/test';

export class AdminCustomersPage {
    private readonly page: Page;
    private readonly customersMenu: Locator;
    private readonly customersListLink: Locator;
    private readonly emailFilter: Locator;
    private readonly filterButton: Locator;
    private readonly customerDetailsHeading: Locator;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly customerEmailInput: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with accessible names verified in the Admin Portal
        this.customersMenu = page.getByRole('link', { name: /Customers/ }).first();
        this.customersListLink = page.getByRole('link', { name: /Customers/ }).last();
        this.emailFilter = page.getByRole('textbox', { name: 'E-Mail' });
        this.filterButton = page.getByRole('button', { name: /Filter/ });
        this.customerDetailsHeading = page.getByRole('heading', { name: /Edit Customer/ });
        this.firstNameInput = page.getByRole('textbox', { name: /First Name/ });
        this.lastNameInput = page.getByRole('textbox', { name: /Last Name/ });
        this.customerEmailInput = page.getByRole('textbox', { name: /E-Mail/ });
    }

    /** Opens the Customers list from the Admin Portal navigation. */
    async openCustomersList(): Promise<void> {
        await this.customersMenu.click();
        await this.customersListLink.click();
    }

    /** Filters the customer list by its unique email address. */
    async searchByEmail(email: string): Promise<void> {
        await this.emailFilter.fill(email);
        await this.filterButton.click();
    }

    /** Returns the result row for the requested email address. */
    getCustomerRow(email: string): Locator {
        return this.page.getByRole('row').filter({
            has: this.page.getByRole('cell', { name: email, exact: true }),
        });
    }

    /** Reads the customer's status displayed in the Customers list. */
    async getCustomerStatus(email: string): Promise<string> {
        return this.getCustomerRow(email).getByRole('cell').nth(4).innerText();
    }

    /** Opens the matching customer record for detail verification. */
    async openCustomerDetails(email: string): Promise<void> {
        await this.getCustomerRow(email).getByRole('link').click();
    }

    /** Checks that the customer edit record is displayed. */
    async isCustomerDetailsDisplayed(): Promise<boolean> {
        return this.customerDetailsHeading.isVisible();
    }

    /** Reads the customer's first name from the record. */
    async getFirstName(): Promise<string> {
        return this.firstNameInput.inputValue();
    }

    /** Reads the customer's last name from the record. */
    async getLastName(): Promise<string> {
        return this.lastNameInput.inputValue();
    }

    /** Reads the customer's email from the record. */
    async getEmail(): Promise<string> {
        return this.customerEmailInput.inputValue();
    }
}
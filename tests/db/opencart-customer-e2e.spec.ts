import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';

test('DB - Register customer through UI, verify in Admin and MySQL @master @regression @db @end-to-end', async ({
    accountPage,
    adminCustomersPage,
    adminLoginPage,
    homePage,
    registerPage,
}) => {
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getEmail().replace('@', `.${Date.now()}@`),
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(12),
    };

    await test.step('1) Register a unique customer through the frontend', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
        await homePage.openRegisterPage();
        expect(await registerPage.isRegistrationPageDisplayed()).toBeTruthy();
        await registerPage.register(
            customer.firstName,
            customer.lastName,
            customer.email,
            customer.telephone,
            customer.password,
        );
        expect(await accountPage.isRegistrationSuccessful()).toBeTruthy();
    });

    await test.step('2) Verify the customer in the Admin Portal', async () => {
        const adminUsername = process.env.ADMIN_USERNAME ?? '';
        const adminPassword = process.env.ADMIN_PASSWORD ?? '';
        expect(adminUsername.length, 'ADMIN_USERNAME must be configured').toBeGreaterThan(0);
        expect(adminPassword.length, 'ADMIN_PASSWORD must be configured').toBeGreaterThan(0);

        await adminLoginPage.openAdminPortal();
        await adminLoginPage.login(adminUsername, adminPassword);
        expect(await adminLoginPage.isDashboardDisplayed()).toBeTruthy();
        await adminLoginPage.dismissSecurityNotification();

        await adminCustomersPage.openCustomersList();
        await adminCustomersPage.searchByEmail(customer.email);
        await expect(adminCustomersPage.getCustomerRow(customer.email)).toBeVisible();
        expect(await adminCustomersPage.getCustomerStatus(customer.email)).toBe('Enabled');

        await adminCustomersPage.openCustomerDetails(customer.email);
        expect(await adminCustomersPage.isCustomerDetailsDisplayed()).toBeTruthy();
        expect(await adminCustomersPage.getFirstName()).toBe(customer.firstName);
        expect(await adminCustomersPage.getLastName()).toBe(customer.lastName);
        expect(await adminCustomersPage.getEmail()).toBe(customer.email);
    });

    await test.step('3) Verify the registered customer in MySQL', async () => {
        const [customerRows] = await executeQuery(
            'SELECT firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?',
            [customer.email],
        );
        const rows = customerRows as Array<{
            firstname: string;
            lastname: string;
            email: string;
            status: number;
            date_added: Date | string;
        }>;

        expect(rows, 'Exactly one database customer should match the registered email').toHaveLength(1);
        expect(rows[0].firstname).toBe(customer.firstName);
        expect(rows[0].lastname).toBe(customer.lastName);
        expect(rows[0].email).toBe(customer.email);
        expect(rows[0].status).toBe(1);
        expect(rows[0].date_added).toBeTruthy();
    });

    console.log('Customer registration was verified in the frontend, Admin Portal, and MySQL.');
});
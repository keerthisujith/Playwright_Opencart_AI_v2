import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('User Registration Flow @master @sanity @regression @end-to-end @web', async ({
    accountPage,
    homePage,
    registerPage,
}) => {
    const customerPassword = RandomDataUtil.getPassword(12);
    const customerTelephone = RandomDataUtil.getPhoneNumber();
    let customerEmail = '';

    await test.step('1) Open the application', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
    });

    await test.step('2) Navigate to My Account → Register', async () => {
        await homePage.openRegisterPage();
    });

    await test.step('3) Verify the registration page is displayed', async () => {
        expect(await registerPage.isRegistrationPageDisplayed()).toBeTruthy();
    });

    await test.step('4) Generate a unique customer email', async () => {
        customerEmail = RandomDataUtil.getEmail().replace('@', `.${Date.now()}@`);
    });

    await test.step('5-7) Enter valid details, accept the Privacy Policy, and submit', async () => {
        await registerPage.register(
            RandomDataUtil.getFirstName(),
            RandomDataUtil.getLastName(),
            customerEmail,
            customerTelephone,
            customerPassword,
        );
    });

    await test.step('8-9) Verify registration succeeds and the confirmation is displayed', async () => {
        expect(await accountPage.isRegistrationSuccessful()).toBeTruthy();
    });

    await test.step('10) Open the new account through My Account navigation', async () => {
        await accountPage.openMyAccountPage();
        expect(await accountPage.isAccountPageDisplayed()).toBeTruthy();
    });

    console.log('User Registration Flow completed successfully.');
});
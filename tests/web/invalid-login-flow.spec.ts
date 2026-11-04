import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Invalid Login Flow @master @sanity @regression @web', async ({
    accountPage,
    homePage,
    loginPage,
}) => {
    const invalidEmail = RandomDataUtil.getEmail().replace('@', `.${Date.now()}@`);
    const invalidPassword = RandomDataUtil.getPassword(12);

    await test.step('1) Open the application', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
    });

    await test.step('2) Navigate to My Account → Login', async () => {
        await homePage.openLoginPage();
        expect(await loginPage.isLoginPageDisplayed()).toBeTruthy();
    });

    await test.step('3-4) Submit invalid customer credentials', async () => {
        await loginPage.login(invalidEmail, invalidPassword);
    });

    await test.step('5-6) Verify authentication fails with the expected warning', async () => {
        expect(await loginPage.getLoginWarning()).toBe(
            'Warning: No match for E-Mail Address and/or Password.',
        );
    });

    await test.step('7) Verify the customer is not authenticated', async () => {
        expect(await accountPage.isAccountPageDisplayed()).toBeFalsy();
        expect(await loginPage.isLoginPageDisplayed()).toBeTruthy();
    });

    console.log('Invalid Login Flow completed successfully.');
});
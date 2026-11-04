import { test, expect } from '../../fixtures/pageFixtures';

test('Valid Login Flow @master @sanity @regression @web', async ({
    accountPage,
    homePage,
    loginPage,
}) => {
    const email = process.env.APP_EMAIL ?? '';
    const password = process.env.APP_PASSWORD ?? '';

    await test.step('1) Open the application', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
    });

    await test.step('2) Navigate to My Account → Login', async () => {
        await homePage.openLoginPage();
    });

    await test.step('3) Verify the login page is displayed', async () => {
        expect(await loginPage.isLoginPageDisplayed()).toBeTruthy();
    });

    await test.step('4-5) Enter configured customer credentials and submit', async () => {
        await loginPage.login(email, password);
    });

    await test.step('6-7) Verify authentication and redirect to My Account', async () => {
        expect(await accountPage.isAccountPageDisplayed()).toBeTruthy();
    });

    await test.step('8) Verify authenticated account navigation is visible', async () => {
        expect(await accountPage.isAuthenticatedNavigationDisplayed()).toBeTruthy();
    });

    console.log('Valid Login Flow completed successfully.');
});
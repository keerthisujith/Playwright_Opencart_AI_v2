import { test, expect } from '../../fixtures/pageFixtures';

test('Logout Flow @master @sanity @regression @web', async ({
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
        expect(await loginPage.isLoginPageDisplayed()).toBeTruthy();
    });

    await test.step('3) Log in using valid customer credentials', async () => {
        await loginPage.login(email, password);
    });

    await test.step('4) Verify authentication succeeds', async () => {
        expect(await accountPage.isAccountPageDisplayed()).toBeTruthy();
    });

    await test.step('5) Click Logout', async () => {
        await accountPage.logout();
    });

    await test.step('6) Verify the logout confirmation page', async () => {
        expect(await accountPage.isLoggedOut()).toBeTruthy();
    });

    await test.step('7) Click Continue', async () => {
        await accountPage.continueAfterLogout();
    });

    await test.step('8) Verify redirect to the homepage', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
    });

    await test.step('9) Verify authenticated account options are unavailable', async () => {
        expect(await homePage.isLoggedOutAccountMenuDisplayed()).toBeTruthy();
        expect(await accountPage.isAuthenticatedNavigationDisplayed()).toBeFalsy();
    });

    console.log('Logout Flow completed successfully.');
});
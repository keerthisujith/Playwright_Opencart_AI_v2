import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('End-to-End Shopping Flow @master @sanity @regression @end-to-end @web', async ({
    page,
    accountPage,
    cartPage,
    homePage,
    loginPage,
    productPage,
    registerPage,
    searchPage,
}) => {
    const productDetails = Helper.getProductDetails();
    const customerEmail = RandomDataUtil.getEmail().replace('@', `.${Date.now()}@`);
    const customerPassword = RandomDataUtil.getPassword(12);
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        telephone: RandomDataUtil.getPhoneNumber(),
    };
    const pageErrors: string[] = [];

    page.on('pageerror', (error) => pageErrors.push(error.message));

    await test.step('1) Open the application', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
    });

    await test.step('2) Register a new customer with unique data', async () => {
        await homePage.openRegisterPage();
        await registerPage.register(
            customer.firstName,
            customer.lastName,
            customerEmail,
            customer.telephone,
            customerPassword,
        );
    });

    await test.step('3) Verify successful registration', async () => {
        expect(await accountPage.isRegistrationSuccessful()).toBeTruthy();
    });

    await test.step('4) Log out', async () => {
        await accountPage.logout();
        expect(await accountPage.isLoggedOut()).toBeTruthy();
    });

    await test.step('5) Log in with the new customer credentials', async () => {
        await homePage.openLoginPage();
        await loginPage.login(customerEmail, customerPassword);
    });

    await test.step('6) Verify successful authentication', async () => {
        expect(await accountPage.isAccountPageDisplayed()).toBeTruthy();
    });

    await test.step('7) Search for the known product', async () => {
        await homePage.searchProduct(productDetails.productName);
        expect(await searchPage.isProductDisplayed(productDetails.productName)).toBeTruthy();
    });

    await test.step('8) Open the product details page', async () => {
        await searchPage.openProduct(productDetails.productName);
        expect(await productPage.isProductDisplayed(productDetails.productName)).toBeTruthy();
        expect(await productPage.getQuantity()).toBe(productDetails.productQuantity);
    });

    await test.step('9) Add the product to the cart', async () => {
        await productPage.addToCart();
    });

    await test.step('10) Open the shopping cart', async () => {
        await cartPage.openShoppingCart();
        expect(await cartPage.isCartDisplayed()).toBeTruthy();
    });

    await test.step('11) Verify the correct product is in the cart', async () => {
        await expect(cartPage.getProductRow(productDetails.productName)).toContainText(
            productDetails.productName,
        );
    });

    await test.step('12) Verify the product quantity', async () => {
        expect(await cartPage.getProductQuantity(productDetails.productName)).toBe(
            productDetails.productQuantity,
        );
    });

    await test.step('13) Verify the product price', async () => {
        expect(await cartPage.getProductUnitPrice(productDetails.productName)).toBe(
            productDetails.totalPrice,
        );
    });

    await test.step('14) Verify the applicable cart total', async () => {
        expect(await cartPage.getProductLineTotal(productDetails.productName)).toBe(
            productDetails.totalPrice,
        );
        expect(await cartPage.getCartTotal()).toBe(productDetails.totalPrice);
    });

    await test.step('15) Verify the journey finishes without page errors', async () => {
        expect(pageErrors).toEqual([]);
    });

    console.log('End-to-End Shopping Flow completed successfully.');
});
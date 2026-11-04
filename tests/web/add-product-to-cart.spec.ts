import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Add Product to Cart @master @sanity @regression @web', async ({
    cartPage,
    homePage,
    productPage,
    searchPage,
}) => {
    const { productName, productQuantity } = Helper.getProductDetails();

    await test.step('1) Open the application', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
    });

    await test.step('2-3) Search for the known product and open its details', async () => {
        await homePage.searchProduct(productName);
        expect(await searchPage.isProductDisplayed(productName)).toBeTruthy();
        await searchPage.openProduct(productName);
    });

    await test.step('4) Verify the product details are displayed', async () => {
        expect(await productPage.isProductDisplayed(productName)).toBeTruthy();
    });

    await test.step('5) Set the required product quantity', async () => {
        await productPage.setQuantity(productQuantity);
        expect(await productPage.getQuantity()).toBe(productQuantity);
    });

    await test.step('6) Add the product to the cart', async () => {
        await productPage.addToCart();
    });

    await test.step('7) Verify the product-added confirmation', async () => {
        await expect(productPage.getAddToCartMessage()).resolves.toContain(
            `Success: You have added ${productName} to your shopping cart!`,
        );
    });

    await test.step('8) Open the shopping cart', async () => {
        await cartPage.openShoppingCart();
        expect(await cartPage.isCartDisplayed()).toBeTruthy();
    });

    await test.step('9) Verify the selected product is in the cart', async () => {
        await expect(cartPage.getProductRow(productName)).toContainText(productName);
    });

    await test.step('10) Verify the cart quantity matches the requested quantity', async () => {
        expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
    });

    console.log('Add Product to Cart completed successfully.');
});
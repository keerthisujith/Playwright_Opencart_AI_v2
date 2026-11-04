import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Product Search Flow @master @sanity @regression @web', async ({
    homePage,
    searchPage,
}) => {
    const { productName } = Helper.getProductDetails();

    await test.step('1) Open the application', async () => {
        expect(await homePage.isStorefrontDisplayed()).toBeTruthy();
    });

    await test.step('2-4) Search for the known product', async () => {
        await homePage.searchProduct(productName);
    });

    await test.step('5) Verify the search results page is displayed', async () => {
        expect(await searchPage.isSearchResultsPageDisplayed()).toBeTruthy();
    });

    await test.step('6-7) Verify the expected product and matching name', async () => {
        expect(await searchPage.isProductDisplayed(productName)).toBeTruthy();
    });

    console.log('Product Search Flow completed successfully.');
});
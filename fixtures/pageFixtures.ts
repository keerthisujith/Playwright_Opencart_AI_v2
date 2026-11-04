import { test as base, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { AccountPage } from '../pages/AccountPage';
import { AdminCustomersPage } from '../pages/AdminCustomersPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { CartPage } from '../pages/CartPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SearchPage } from '../pages/SearchPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL || 'http://localhost/opencart/upload/';

type PageFixtures = {
    accountPage: AccountPage;
    adminCustomersPage: AdminCustomersPage;
    adminLoginPage: AdminLoginPage;
    cartPage: CartPage;
    homePage: HomePage;
    loginPage: LoginPage;
    productPage: ProductPage;
    registerPage: RegisterPage;
    searchPage: SearchPage;
};

export const test = base.extend<PageFixtures>({
    accountPage: async ({ page }, use) => {
        await use(new AccountPage(page));
    },
    adminCustomersPage: async ({ page }, use) => {
        await use(new AdminCustomersPage(page));
    },
    adminLoginPage: async ({ page }, use) => {
        await use(new AdminLoginPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    homePage: async ({ page }, use) => {
        await page.goto(APP_URL);
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },
    searchPage: async ({ page }, use) => {
        await use(new SearchPage(page));
    },
});

test.afterEach(async ({ page, context }) => {
    if (!page.isClosed()) {
        await page.close();
    }
    await context.close();
});

export { expect };
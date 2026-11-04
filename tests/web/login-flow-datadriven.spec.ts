import path from 'path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';

type LoginTestCase = {
    testName?: string;
    TestName?: string;
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

const testDataPath = path.resolve(__dirname, '../../testdata/opencart_logindata.json');
const loginTestCases = DataProvider.readJson(testDataPath) as LoginTestCase[];

loginTestCases.forEach((testCase, index) => {
    const scenarioName = testCase.testName ?? testCase.TestName ?? 'Login test';

    test(`${scenarioName} - row ${index + 1} @master @sanity @regression @datadriven @web`, async ({
        accountPage,
        homePage,
        loginPage,
    }) => {
        const email = testCase.email.trim();
        const password = testCase.password.trim();

        await test.step('1) Open the OpenCart login page', async () => {
            await homePage.openLoginPage();
        });

        await test.step('2) Enter the data row credentials and submit', async () => {
            await loginPage.login(email, password);
        });

        await test.step('3) Validate the login result', async () => {
            if (testCase.expected === 'success') {
                expect(await accountPage.isAccountPageDisplayed()).toBeTruthy();
            } else {
                expect(await accountPage.isAccountPageDisplayed()).toBeFalsy();
                expect(await loginPage.getLoginWarning()).toMatch(
                    /^Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts\.)/,
                );
            }
        });
    });
});
import { test, expect, type APIRequestContext } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const START_DATE = '2020-01-01';
const END_DATE = '2020-03-31';

async function getFirstCart(request: APIRequestContext) {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), 'Cart records should be available').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'The carts response should be an array').toBeTruthy();
    expect(carts.length, 'At least one cart is required').toBeGreaterThan(0);
    return carts[0];
}

async function getFirstUserId(request: APIRequestContext): Promise<number> {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), 'User records should be available').toBe(200);
    const users = await response.json();
    expect(users.length, 'At least one user is required to create a cart').toBeGreaterThan(0);
    return users[0].id;
}

test('GET - All Carts @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status(), 'All carts should return status 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'The carts response should be an array').toBeTruthy();
    expect(carts.length, 'The carts response should not be empty').toBeGreaterThan(0);
});

test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
    const cart = await getFirstCart(request);
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(cart.id));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'A valid cart ID should return status 200').toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id, 'The returned ID should match the requested ID').toBe(cart.id);
});

test('GET - Carts by Date Range @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE
        .replace('{startdate}', START_DATE)
        .replace('{enddate}', END_DATE);
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Date-filtered carts should return status 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'The date-filtered response should be an array').toBeTruthy();
    expect(carts.length, 'The selected date range should contain carts').toBeGreaterThan(0);

    for (const cart of carts) {
        const cartDate = cart.date.slice(0, 10);
        expect(cartDate >= START_DATE && cartDate <= END_DATE).toBeTruthy();
    }
});

test('GET - Carts by User @master @regression @api', async ({ request }) => {
    const userCart = await getFirstCart(request);
    const route = Routes.GET_USER_CART.replace('{userId}', String(userCart.userId));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'User carts should return status 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'The user cart response should be an array').toBeTruthy();
    expect(carts.length, 'The selected user should have carts').toBeGreaterThan(0);
    expect(carts.every((cart: { userId: number }) => cart.userId === userCart.userId)).toBeTruthy();
});

test('GET - Carts with Limit @master @regression @api', async ({ request }) => {
    const limit = 3;
    const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(limit));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Limited carts should return status 200').toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts), 'The limited response should be an array').toBeTruthy();
    expect(carts.length, 'The result count should match the requested limit').toBe(limit);
});

test('GET - Carts Sorted Ascending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Ascending cart sort should return status 200').toBe(200);

    const carts = await response.json();
    const cartIds = carts.map((cart: { id: number }) => cart.id);
    expect(cartIds.length).toBeGreaterThan(0);
    expect(cartIds).toEqual([...cartIds].sort((first, second) => first - second));
});

test('GET - Carts Sorted Descending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_CARTS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Descending cart sort should return status 200').toBe(200);

    const carts = await response.json();
    const cartIds = carts.map((cart: { id: number }) => cart.id);
    expect(cartIds.length).toBeGreaterThan(0);
    expect(cartIds).toEqual([...cartIds].sort((first, second) => second - first));
});

test('POST - Create Cart @master @regression @api', async ({ request }) => {
    const userId = await getFirstUserId(request);
    const cartPayload = RandomDataUtil.generateCartPayload(userId);
    const response = await request.post(`${API_BASE_URL}${Routes.CREATE_CART}`, { data: cartPayload });
    expect(response.status(), 'Cart creation should return status 201').toBe(201);

    const createdCart = await response.json();
    expect(createdCart.id, 'The created cart should have a numeric ID').toEqual(expect.any(Number));
    expect(createdCart.userId).toBe(userId);
    expect(createdCart.products).toEqual(cartPayload.products);
});

test('PUT - Update Cart @master @regression @api', async ({ request }) => {
    const cart = await getFirstCart(request);
    const cartPayload = RandomDataUtil.generateUpdatedCartPayload(cart.userId);
    cartPayload.date = cart.date;
    cartPayload.products = cart.products.map(
        (product: { productId: number; quantity: number }) => ({
            ...product,
            quantity: product.quantity + 1,
        }),
    );
    const route = Routes.UPDATE_CART.replace('{id}', String(cart.id));
    const response = await request.put(`${API_BASE_URL}${route}`, { data: cartPayload });
    expect(response.status(), 'Cart update should return status 200').toBe(200);

    const updatedCart = await response.json();
    expect(updatedCart.userId).toBe(cart.userId);
    expect(updatedCart.products[0].quantity).toBe(cart.products[0].quantity + 1);
});

test('DELETE - Cart @master @regression @api', async ({ request }) => {
    const cart = await getFirstCart(request);
    const route = Routes.DELETE_CART.replace('{id}', String(cart.id));
    const response = await request.delete(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Cart deletion should return status 200').toBe(200);

    const responseText = await response.text();
    if (responseText.length > 0) {
        expect(() => JSON.parse(responseText), 'A non-empty delete response should be valid JSON').not.toThrow();
    }
});

test('GET - Cart Response Schema @master @regression @api', async ({ request }) => {
    const cart = await getFirstCart(request);
    const route = Routes.GET_CART_BY_ID.replace('{id}', String(cart.id));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'The cart schema sample should return status 200').toBe(200);

    const responseBody = await response.json();
    const schema = DataProvider.readJson(
        path.resolve(__dirname, '../../api/schemas/cart_api_schema.json'),
    );
    const validator = new Ajv();
    const isValid = validator.validate(schema, responseBody);
    expect(isValid, `Cart response schema mismatch: ${validator.errorsText(validator.errors)}`).toBe(true);
});
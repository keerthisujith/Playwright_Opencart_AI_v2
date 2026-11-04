import { test, expect, type APIRequestContext } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

async function getFirstProductId(request: APIRequestContext): Promise<number> {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), 'Product records should be available').toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), 'The products response should be an array').toBeTruthy();
    expect(products.length, 'At least one product is required').toBeGreaterThan(0);
    return products[0].id;
}

test('GET - All Products @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status(), 'All products should return status 200').toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), 'The products response should be an array').toBeTruthy();
    expect(products.length, 'The products response should not be empty').toBeGreaterThan(0);

    for (const product of products) {
        expect(product.id, 'Each product should have a numeric ID').toEqual(expect.any(Number));
        expect(product.title, 'Each product should have a title').toEqual(expect.any(String));
        expect(product.price, 'Each product should have a numeric price').toEqual(expect.any(Number));
        expect(product.category, 'Each product should have a category').toEqual(expect.any(String));
        expect(product.image, 'Each product should have an image URL').toEqual(expect.any(String));
    }
});

test('GET - Product by ID @master @sanity @api', async ({ request }) => {
    const productId = await getFirstProductId(request);
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(productId));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'A valid product ID should return status 200').toBe(200);

    const product = await response.json();
    expect(product.id, 'The returned ID should match the requested ID').toBe(productId);
    expect(product.title).toEqual(expect.any(String));
    expect(product.price).toEqual(expect.any(Number));
    expect(product.category).toEqual(expect.any(String));
    expect(product.image).toEqual(expect.any(String));
});

test('GET - Products with Limit @master @regression @api', async ({ request }) => {
    const limit = 3;
    const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(limit));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Limited products should return status 200').toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), 'The limited response should be an array').toBeTruthy();
    expect(products.length, 'The result count should match the requested limit').toBe(limit);
});

test('GET - Products Sorted Ascending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Ascending product sort should return status 200').toBe(200);

    const products = await response.json();
    const productIds = products.map((product: { id: number }) => product.id);
    expect(productIds.length).toBeGreaterThan(0);
    expect(productIds).toEqual([...productIds].sort((first, second) => first - second));
});

test('GET - Products Sorted Descending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Descending product sort should return status 200').toBe(200);

    const products = await response.json();
    const productIds = products.map((product: { id: number }) => product.id);
    expect(productIds.length).toBeGreaterThan(0);
    expect(productIds).toEqual([...productIds].sort((first, second) => second - first));
});

test('GET - All Product Categories @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status(), 'Product categories should return status 200').toBe(200);

    const categories = await response.json();
    expect(Array.isArray(categories), 'The category response should be an array').toBeTruthy();
    expect(categories.length, 'The category response should not be empty').toBeGreaterThan(0);
    expect(categories.every((category: unknown) => typeof category === 'string')).toBeTruthy();
});

test('GET - Products by Category @master @regression @api', async ({ request }) => {
    const category = 'electronics';
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', category);
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Category products should return status 200').toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), 'The category product response should be an array').toBeTruthy();
    expect(products.length, 'The category should have matching products').toBeGreaterThan(0);
    expect(products.every((product: { category: string }) => product.category === category)).toBeTruthy();
});

test('POST - Create Product @master @regression @api', async ({ request }) => {
    const productPayload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${API_BASE_URL}${Routes.CREATE_PRODUCT}`, {
        data: productPayload,
    });
    expect(response.status(), 'Product creation should return status 201').toBe(201);

    const createdProduct = await response.json();
    expect(createdProduct.id, 'The created product should have a numeric ID').toEqual(expect.any(Number));
    expect(createdProduct).toMatchObject(productPayload);
});

test('PUT - Update Product @master @regression @api', async ({ request }) => {
    const productId = await getFirstProductId(request);
    const updatedProduct = RandomDataUtil.generateUpdatedProductPayload();
    const route = Routes.UPDATE_PRODUCT.replace('{id}', String(productId));
    const response = await request.put(`${API_BASE_URL}${route}`, { data: updatedProduct });
    expect(response.status(), 'Product update should return status 200').toBe(200);

    const responseBody = await response.json();
    expect(responseBody.id, 'The returned ID should match the requested ID').toBe(productId);
    expect(responseBody).toMatchObject(updatedProduct);
});

test('DELETE - Product @master @regression @api', async ({ request }) => {
    const productId = await getFirstProductId(request);
    const route = Routes.DELETE_PRODUCT.replace('{id}', String(productId));
    const response = await request.delete(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Product deletion should return status 200').toBe(200);

    const responseText = await response.text();
    if (responseText.length > 0) {
        expect(() => JSON.parse(responseText), 'A non-empty delete response should be valid JSON').not.toThrow();
    }
});

test('GET - Product Response Schema @master @regression @api', async ({ request }) => {
    const productId = await getFirstProductId(request);
    const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(productId));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'The product schema sample should return status 200').toBe(200);

    const product = await response.json();
    const schema = DataProvider.readJson(
        path.resolve(__dirname, '../../api/schemas/product_api_schema.json'),
    );
    const validator = new Ajv();
    const isValid = validator.validate(schema, product);
    expect(isValid, `Product response schema mismatch: ${validator.errorsText(validator.errors)}`).toBe(true);
});
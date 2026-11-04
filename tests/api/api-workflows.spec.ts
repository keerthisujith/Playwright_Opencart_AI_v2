import { test, expect, type APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

async function getFirstUserId(request: APIRequestContext): Promise<number> {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), 'User records should be available to create a cart').toBe(200);
    const users = await response.json();
    expect(users.length).toBeGreaterThan(0);
    return users[0].id;
}

test('Workflow - Product CRUD @master @regression @api @workflow', async ({ request }) => {
    const productPayload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${API_BASE_URL}${Routes.CREATE_PRODUCT}`, {
        data: productPayload,
    });
    expect(createResponse.status(), 'Product creation should return status 201').toBe(201);

    const createdProduct = await createResponse.json();
    const productId = createdProduct.id;
    expect(productId, 'The workflow should capture the created product ID').toEqual(expect.any(Number));

    const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(productId));
    const updateResponse = await request.put(`${API_BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'Product update should return status 200').toBe(200);

    const updatedProduct = await updateResponse.json();
    expect(updatedProduct.id).toBe(productId);
    expect(updatedProduct).toMatchObject(updatePayload);

    const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(productId));
    const deleteResponse = await request.delete(`${API_BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'Product deletion should return status 200').toBe(200);
});

test('Workflow - User CRUD @master @regression @api @workflow', async ({ request }) => {
    const userPayload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${API_BASE_URL}${Routes.CREATE_USER}`, {
        data: userPayload,
    });
    expect(createResponse.status(), 'User creation should return status 201').toBe(201);

    const createdUser = await createResponse.json();
    const userId = createdUser.id;
    expect(userId, 'The workflow should capture the created user ID').toEqual(expect.any(Number));

    const updatePayload = RandomDataUtil.generateUserUpdatePayload();
    const updateRoute = Routes.UPDATE_USER.replace('{id}', String(userId));
    const updateResponse = await request.put(`${API_BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'User update should return status 200').toBe(200);

    const updatedUser = await updateResponse.json();
    expect(updatedUser).toMatchObject(updatePayload);

    const deleteRoute = Routes.DELETE_USER.replace('{id}', String(userId));
    const deleteResponse = await request.delete(`${API_BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'User deletion should return status 200').toBe(200);
});

test('Workflow - Cart CRUD @master @regression @api @workflow', async ({ request }) => {
    const userId = await getFirstUserId(request);
    const cartPayload = RandomDataUtil.generateCartPayload(userId);
    const createResponse = await request.post(`${API_BASE_URL}${Routes.CREATE_CART}`, {
        data: cartPayload,
    });
    expect(createResponse.status(), 'Cart creation should return status 201').toBe(201);

    const createdCart = await createResponse.json();
    const cartId = createdCart.id;
    expect(cartId, 'The workflow should capture the created cart ID').toEqual(expect.any(Number));
    expect(createdCart.userId).toBe(userId);
    expect(createdCart.products).toEqual(cartPayload.products);

    const updatePayload = RandomDataUtil.generateUpdatedCartPayload(userId);
    updatePayload.products = cartPayload.products.map((product) => ({
        ...product,
        quantity: product.quantity + 1,
    }));
    const updateRoute = Routes.UPDATE_CART.replace('{id}', String(cartId));
    const updateResponse = await request.put(`${API_BASE_URL}${updateRoute}`, { data: updatePayload });
    expect(updateResponse.status(), 'Cart update should return status 200').toBe(200);

    const updatedCart = await updateResponse.json();
    expect(updatedCart.products[0].quantity).toBe(cartPayload.products[0].quantity + 1);

    const deleteRoute = Routes.DELETE_CART.replace('{id}', String(cartId));
    const deleteResponse = await request.delete(`${API_BASE_URL}${deleteRoute}`);
    expect(deleteResponse.status(), 'Cart deletion should return status 200').toBe(200);
});
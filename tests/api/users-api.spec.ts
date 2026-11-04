import { test, expect, type APIRequestContext } from '@playwright/test';
import Ajv from 'ajv';
import dotenv from 'dotenv';
import path from 'path';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

async function getFirstUserId(request: APIRequestContext): Promise<number> {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), 'User records should be available').toBe(200);

    const users = await response.json();
    expect(Array.isArray(users), 'The users response should be an array').toBeTruthy();
    expect(users.length, 'At least one user is required').toBeGreaterThan(0);
    return users[0].id;
}

test('GET - All Users @master @sanity @api', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status(), 'All users should return status 200').toBe(200);

    const users = await response.json();
    expect(Array.isArray(users), 'The users response should be an array').toBeTruthy();
    expect(users.length, 'The users response should not be empty').toBeGreaterThan(0);
});

test('GET - User by ID @master @sanity @api', async ({ request }) => {
    const userId = await getFirstUserId(request);
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(userId));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'A valid user ID should return status 200').toBe(200);

    const user = await response.json();
    expect(user.id, 'The returned ID should match the requested ID').toBe(userId);
    expect(user.username).toEqual(expect.any(String));
    expect(user.email).toEqual(expect.any(String));
});

test('GET - Users with Limit @master @regression @api', async ({ request }) => {
    const limit = 3;
    const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(limit));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Limited users should return status 200').toBe(200);

    const users = await response.json();
    expect(Array.isArray(users), 'The limited response should be an array').toBeTruthy();
    expect(users.length, 'The result count should match the requested limit').toBe(limit);
});

test('GET - Users Sorted Ascending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace('{order}', 'asc');
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Ascending user sort should return status 200').toBe(200);

    const users = await response.json();
    const userIds = users.map((user: { id: number }) => user.id);
    expect(userIds.length).toBeGreaterThan(0);
    expect(userIds).toEqual([...userIds].sort((first, second) => first - second));
});

test('GET - Users Sorted Descending @master @regression @api', async ({ request }) => {
    const route = Routes.GET_USERS_SORTED.replace('{order}', 'desc');
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'Descending user sort should return status 200').toBe(200);

    const users = await response.json();
    const userIds = users.map((user: { id: number }) => user.id);
    expect(userIds.length).toBeGreaterThan(0);
    expect(userIds).toEqual([...userIds].sort((first, second) => second - first));
});

test('POST - Create User @master @regression @api', async ({ request }) => {
    const userPayload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${API_BASE_URL}${Routes.CREATE_USER}`, {
        data: userPayload,
    });
    expect(response.status(), 'User creation should return status 201').toBe(201);

    const createdUser = await response.json();
    expect(createdUser.id, 'The created user should have a numeric ID').toEqual(expect.any(Number));
});

test('PUT - Update User @master @regression @api', async ({ request }) => {
    const userId = await getFirstUserId(request);
    const updatedUser = RandomDataUtil.generateUserUpdatePayload();
    const route = Routes.UPDATE_USER.replace('{id}', String(userId));
    const response = await request.put(`${API_BASE_URL}${route}`, { data: updatedUser });
    expect(response.status(), 'User update should return status 200').toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toMatchObject(updatedUser);
});

test('DELETE - User @master @regression @api', async ({ request }) => {
    const userId = await getFirstUserId(request);
    const route = Routes.DELETE_USER.replace('{id}', String(userId));
    const response = await request.delete(`${API_BASE_URL}${route}`);
    expect(response.status(), 'User deletion should return status 200').toBe(200);

    const deletedUser = await response.json();
    expect(deletedUser.id, 'The delete response should identify the deleted user').toBe(userId);
});

test('GET - User Response Schema @master @regression @api', async ({ request }) => {
    const userId = await getFirstUserId(request);
    const route = Routes.GET_USER_BY_ID.replace('{id}', String(userId));
    const response = await request.get(`${API_BASE_URL}${route}`);
    expect(response.status(), 'The user schema sample should return status 200').toBe(200);

    const user = await response.json();
    const schema = DataProvider.readJson(
        path.resolve(__dirname, '../../api/schemas/user_api_schema.json'),
    );
    const validator = new Ajv();
    const isValid = validator.validate(schema, user);
    expect(isValid, `User response schema mismatch: ${validator.errorsText(validator.errors)}`).toBe(true);
});
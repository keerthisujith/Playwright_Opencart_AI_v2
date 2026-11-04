import { test, expect, type APIRequestContext } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;

test('POST - Successful Login @master @sanity @api', async ({ request }) => {
    const usersResponse = await request.get(`${API_BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(usersResponse.status(), 'User test data should be available').toBe(200);

    const users = await usersResponse.json();
    expect(Array.isArray(users), 'The user response should be an array').toBeTruthy();
    expect(users.length, 'At least one user is required for login').toBeGreaterThan(0);

    const user = users[0];
    const response = await request.post(`${API_BASE_URL}${Routes.AUTH_LOGIN}`, {
        data: {
            username: user.username,
            password: user.password,
        },
    });

    expect(response.status(), 'Valid credentials should return status 201').toBe(201);

    const responseBody = await response.json();
    expect(typeof responseBody.token, 'The response token should be a string').toBe('string');
    expect(responseBody.token.length, 'The response token should not be empty').toBeGreaterThan(0);
});

test('POST - Invalid Login @master @regression @api', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}${Routes.AUTH_LOGIN}`, {
        data: RandomDataUtil.generateInvalidLoginPayload(),
    });

    expect(response.status(), 'Invalid credentials should return status 401').toBe(401);
    expect(await response.text(), 'The API should explain why authentication failed').toBe(
        'username or password is incorrect',
    );
});
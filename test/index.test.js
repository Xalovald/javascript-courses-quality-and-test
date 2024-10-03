const request = require('supertest');
const express = require('express');
const path = require('path');
const indexRouter = require('../index'); // Ensure this imports a valid Express router

describe('Index Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.static(path.join(__dirname, 'public')));
        app.set('view engine', 'ejs');
        app.use('/', indexRouter); // Add the routes from index.js
    });

    test('GET / should load the game page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('game'); // Adjust based on what should be present
    });

    test('POST / should handle player guessing', async () => {
        const response = await request(app).post('/').send({ word: 'a' });
        expect(response.status).toBe(200);
        expect(response.text).toContain('game'); // Adjust based on what should be present
    });

    test('GET /player/:name should retrieve player data', async () => {
        const response = await request(app).get('/player/testUser');
        expect(response.status).toBe(404); // Adjust based on whether the player exists
    });

    test('POST /save-username should save username and score', async () => {
        const response = await request(app).post('/save-username').send({ name: 'testUser', score: 500 });
        expect(response.status).toBe(302); // Expecting a redirect after saving
    });

    test('GET /top-players should return top players', async () => {
        const response = await request(app).get('/top-players');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    });
});

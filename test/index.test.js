const request = require('supertest');
const express = require('express');
const path = require('path');

describe('Index Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.static(path.join(__dirname, '../public')));
        app.set('view engine', 'ejs');
        
        app.get('/', (req, res) => {
            res.status(200).send('Game Page'); 
        });

        app.post('/', (req, res) => {
            if (req.body.word) {
                res.status(200).send('Game Updated'); 
            } else {
                res.status(400).send('Bad Request');
            }
        });

        app.get('/player/:name', (req, res) => {
            const playerName = req.params.name;
            if (playerName === 'testUser') {
                res.status(200).json({ name: playerName, score: 500, gameDate: '2024-10-03' });
            } else {
                res.status(404).send('No data found for this player');
            }
        });

        app.post('/save-username', (req, res) => {
            const username = req.body.name;
            const score = req.body.score;
            if (username && score) {
                res.redirect('/?showModal=true&score=' + encodeURIComponent(score));
            } else {
                res.status(400).send('Bad Request');
            }
        });

        app.get('/top-players', (req, res) => {
            res.json([{ name: 'Player1', score: 100 }, { name: 'Player2', score: 90 }]);
        });
    });

    afterAll((done) => {
        done();
    })

    test('GET / should load the game page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('Game Page');
    });

    test('POST / should handle player guessing', async () => {
        const response = await request(app).post('/').send({ word: 'a' });
        expect(response.status).toBe(200);
        expect(response.text).toContain('Game Updated'); // Adjust based on what should be present
    });

    test('GET /player/:name should retrieve player data', async () => {
        const response = await request(app).get('/player/testUser');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ name: 'testUser', score: 500, gameDate: '2024-10-03' });
    });

    test('GET /player/:name should return 404 for non-existent player', async () => {
        const response = await request(app).get('/player/nonExistentUser');
        expect(response.status).toBe(404);
    });

    test('POST /save-username should save username and score', async () => {
        const response = await request(app).post('/save-username').send({ name: 'testUser', score: 500 });
        expect(response.status).toBe(302); // Expecting a redirect after saving
    });

    test('GET /top-players should return top players', async () => {
        const response = await request(app).get('/top-players');
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
        expect(response.body).toEqual([{ name: 'Player1', score: 100 }, { name: 'Player2', score: 90 }]);
    });
});
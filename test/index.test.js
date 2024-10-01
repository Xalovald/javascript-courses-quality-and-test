const request = require('supertest');
const express = require('express');
const Game = require('../game.js');
const { savePlayerData, getPlayerData, updatescore, getTopPlayers } = require('./database.js'); // Ensure this path is correct

// Mocking the Game and Database modules
jest.mock('../game.js');
jest.mock('./database.js');
jest.mock('sqlite3'); // Assuming sqlite3 is used for database handling in your project

// Importing the Express app
const app = require('../index.js');

describe('Express app', () => {
  // Clear all mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for GET /
  test('GET / should render index page with game data', async () => {
    // Mocking Game implementation
    Game.mockImplementation(() => ({
      loadWords: jest.fn().mockResolvedValue(),
      print: jest.fn().mockReturnValue('####'),
      word: 'test',
      getNumberOfTries: jest.fn().mockReturnValue(5),
      getscore: jest.fn().mockReturnValue(1000),
      checkGameStatus: jest.fn().mockReturnValue('continue'),
      getLettersTried: jest.fn().mockReturnValue(''),
      startscore: jest.fn(),
    }));

    // Making the GET request
    const response = await request(app).get('/');
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.text).toContain('####');
    expect(response.text).toContain('5');
    expect(response.text).toContain('1000');
  });

  // Test for POST /
  test('POST / should handle player guess', async () => {
    // Mocking Game implementation
    Game.mockImplementation(() => ({
      guess: jest.fn(),
      print: jest.fn().mockReturnValue('t###'),
      word: 'test',
      getNumberOfTries: jest.fn().mockReturnValue(4),
      getscore: jest.fn().mockReturnValue(950),
      checkGameStatus: jest.fn().mockReturnValue('continue'),
      getLettersTried: jest.fn().mockReturnValue('t'),
    }));

    // Making the POST request
    const response = await request(app)
      .post('/')
      .send({ word: 't' });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.text).toContain('t###');
    expect(response.text).toContain('4');
    expect(response.text).toContain('950');
  });

  // Test for GET /player/:name
  test('GET /player/:name should render player page', async () => {
    // Mocking getPlayerData
    getPlayerData.mockImplementation((name, callback) => {
      callback({ name: 'TestPlayer', score: 1000, game_date: '2023-01-01' });
    });

    // Making the GET request
    const response = await request(app).get('/player/TestPlayer');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.text).toContain('TestPlayer');
    expect(response.text).toContain('1000');
    expect(response.text).toContain('2023-01-01');
  });

  // Test for POST /save-username
  test('POST /save-username should save player data and redirect', async () => {
    // Mocking savePlayerData
    savePlayerData.mockResolvedValue();

    // Making the POST request
    const response = await request(app)
      .post('/save-username')
      .send({ name: 'TestPlayer', score: 1000 });

    // Assertions
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');
    expect(savePlayerData).toHaveBeenCalledWith('TestPlayer', 1000, expect.any(String));
  });

  // Test for GET /top-players
  test('GET /top-players should return top players', async () => {
    const mockTopPlayers = [
      { name: 'Player1', score: 1000, game_date: '2023-01-01' },
      { name: 'Player2', score: 900, game_date: '2023-01-02' },
    ];

    // Mocking getTopPlayers
    getTopPlayers.mockImplementation((callback) => {
      callback(mockTopPlayers);
    });

    // Making the GET request
    const response = await request(app).get('/top-players');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTopPlayers);
  });

  // Test for GET /pantheon/:username
  test('GET /pantheon/:username should render pantheon page', async () => {
    const response = await request(app).get('/pantheon/TestPlayer');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.text).toContain('TestPlayer');
  });
});

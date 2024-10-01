const { savePlayerData, getPlayerData, updatescore, saveUsername, getTopPlayers } = require('./database.js');

// Mock the sqlite3 module
jest.mock('sqlite3', () => ({
  verbose: jest.fn().mockReturnValue({
    Database: jest.fn().mockImplementation(() => ({
      run: jest.fn(),
      get: jest.fn(),
      all: jest.fn(),
    })),
  }),
}));

describe('Database functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('savePlayerData should save player data', async () => {
    const mockRun = jest.fn((query, params, callback) => callback(null));
    require('sqlite3').verbose().Database.mockImplementation(() => ({
      run: mockRun,
    }));

    await savePlayerData('TestPlayer', 1000, '2023-01-01');
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO players'),
      ['TestPlayer', 1000, '2023-01-01'],
      expect.any(Function)
    );
  });

  test('getPlayerData should retrieve player data', (done) => {
    const mockGet = jest.fn((query, params, callback) => {
      callback(null, { name: 'TestPlayer', score: 1000, game_date: '2023-01-01' });
    });
    require('sqlite3').verbose().Database.mockImplementation(() => ({
      get: mockGet,
    }));

    getPlayerData('TestPlayer', (data) => {
      expect(data).toEqual({ name: 'TestPlayer', score: 1000, game_date: '2023-01-01' });
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM players'),
        ['TestPlayer'],
        expect.any(Function)
      );
      done();
    });
  });

  test('updatescore should update the score', () => {
    const mockRun = jest.fn((query, params, callback) => callback(null));
    require('sqlite3').verbose().Database.mockImplementation(() => ({
      run: mockRun,
    }));

    updatescore(1000, 'win');
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE game_state SET score = ?'),
      [1000],
      expect.any(Function)
    );
  });

  test('saveUsername should save username and redirect', async () => {
    const mockReq = { body: { name: 'TestPlayer', score: 1000 } };
    const mockRes = { redirect: jest.fn() };
    const mockRun = jest.fn((query, params, callback) => callback(null));
    require('sqlite3').verbose().Database.mockImplementation(() => ({
      run: mockRun,
    }));

    await saveUsername(mockReq, mockRes);
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO players'),
      ['TestPlayer', 1000, expect.any(String)],
      expect.any(Function)
    );
    expect(mockRes.redirect).toHaveBeenCalledWith('/');
  });

  test('getTopPlayers should retrieve top players', (done) => {
    const mockAll = jest.fn((query, callback) => {
      callback(null, [{ name: 'TestPlayer', score: 1000, game_date: '2023-01-01' }]);
    });
    require('sqlite3').verbose().Database.mockImplementation(() => ({
      all: mockAll,
    }));

    getTopPlayers((players) => {
      expect(players).toEqual([{ name: 'TestPlayer', score: 1000, game_date: '2023-01-01' }]);
      expect(mockAll).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM players ORDER BY score DESC LIMIT 10'),
        expect.any(Function)
      );
      done();
    });
  });
});
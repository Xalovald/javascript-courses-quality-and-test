const sqlite3 = require('sqlite3').verbose();
const {
    savePlayerData,
    getPlayerData,
    updateScore,
    getTopPlayers,
} = require('../database.js');

let db;

beforeAll(() => {
    db = new sqlite3.Database(':memory:'); // Use in-memory database for testing
    db.serialize(() => {
        db.run(`CREATE TABLE players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            score INTEGER,
            game_date TEXT
        )`);
        db.run(`CREATE TABLE game_state (
            id INTEGER PRIMARY KEY,
            score INTEGER
        )`);
        db.run(`INSERT INTO game_state (id, score) VALUES (1, 1000)`);
    });
});

afterAll(() => {
    db.close();
});

describe('Database Functions', () => {
    test('should save player data', async () => {
        const playerName = 'testPlayer';
        const score = 500;
        const gameDate = new Date().toISOString();
        const id = await savePlayerData(playerName, score, gameDate);
        expect(id).toBeDefined();
        
        // Verify that the player data is saved correctly
        db.get('SELECT * FROM players WHERE id = ?', id, (err, row) => {
            expect(row).toBeDefined();
            expect(row.name).toBe(playerName);
            expect(row.score).toBe(score);
            expect(row.game_date).toBe(gameDate);
        });
    });

    test('should retrieve player data', (done) => {
        const playerName = 'testPlayer';
        getPlayerData(playerName, (data) => {
            expect(data).toBeDefined();
            expect(data.name).toBe(playerName);
            done();
        });
    });

    test('should return null for non-existing player data', (done) => {
        getPlayerData('nonExistingPlayer', (data) => {
            expect(data).toBeNull();
            done();
        });
    });

    test('should update score', (done) => {
        const newScore = 600;
        const result = updateScore(newScore, 'win');
        expect(result).toBeUndefined();
        db.get('SELECT score FROM game_state WHERE id = 1', (err, row) => {
            expect(row.score).toBe(newScore);
            done();
        });
    });

    test('should retrieve top players', (done) => {
        getTopPlayers((players) => {
            expect(players).toBeDefined();
            expect(players.length).toBeGreaterThan(0);
            done();
        });
    });

    test('should return an empty array for top players when no players exist', (done) => {
        // Clear the players table
        db.run('DELETE FROM players', () => {
            getTopPlayers((players) => {
                expect(players).toBeDefined();
                expect(players.length).toBe(0);
                done();
            });
        });
    });
});

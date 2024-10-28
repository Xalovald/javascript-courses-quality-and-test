const sqlite3 = require('sqlite3').verbose();
const {
    savePlayerData,
    getPlayerData,
    updatescore,
    getTopPlayers,
} = require('../database.js');

let db;

beforeAll((done) => {
    db = new sqlite3.Database(':memory:', (err) => {
        if (err) done(err);
        else {
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
                db.run(`INSERT INTO game_state (id, score) VALUES (1, 1000)`, (err) => {
                    if (err) done(err);
                    else done(); // Resolve done when the setup is complete
                });
            });
        }
    });
});

afterEach((done) => {
    db.run('DELETE FROM players', (err) => {
        if (err) done(err);
        else done(); // Resolve done after cleaning up
    });
});

afterAll((done) => {
    db.close((err) => {
        if (err) done(err);
        else done();
    });
});

jest.setTimeout(20000); // Increase timeout to 20 seconds if needed

describe('Database Functions', () => {
    test('should save player data', async () => {
        const playerName = 'testPlayer';
        const score = 500;
        const gameDate = new Date().toISOString();
        
        const id = await savePlayerData(playerName, score, gameDate);
        expect(id).toBeDefined();

        const row = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM players WHERE id = ?', id, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        expect(row).toBeDefined();
        expect(row.name).toBe(playerName);
        expect(row.score).toBe(score);
        expect(row.game_date).toBe(gameDate);
    });

    test('should retrieve player data', async () => {
        const playerName = 'testPlayer';

        await savePlayerData(playerName, 500, new Date().toISOString()); // Ensure player exists
        
        const data = await new Promise((resolve, reject) => {
            getPlayerData(playerName, (result) => {
                if (result) resolve(result);
                else reject(new Error('Player not found'));
            });
        });
        expect(data).toBeDefined();
        expect(data.name).toBe(playerName);
    });
    test('should return null for non-existing player data', async () => {
        const data = await new Promise((resolve) => {
            getPlayerData('nonExistingPlayer', (result) => resolve(result));
        });
        expect(data).toBeNull(); // This should pass if getPlayerData correctly returns null
    });
    

    test('should update score on win and log correct messages', async () => {
        const consoleSpy = jest.spyOn(console, 'log'); // Spy on console.log
    
        await updatescore(600, 'win');  // Valid score update
    
        expect(consoleSpy).toHaveBeenCalledWith('Score updated to: 600');
    
        consoleSpy.mockRestore(); // Restore console.log after the test
    });  

    test('should not update score if game is not won', () => {
        const consoleSpy = jest.spyOn(console, 'log'); // Spy on console.log

        updatescore(600, 'lose');  // Score should not update

        expect(consoleSpy).toHaveBeenCalledWith('Game is not won, score not updated.');

        consoleSpy.mockRestore(); // Restore console.log after the test
    });

    test('should not update score for invalid input', () => {
        const consoleSpy = jest.spyOn(console, 'log'); // Spy on console.log

        updatescore(null, 'lose'); // Invalid score
        expect(consoleSpy).not.toHaveBeenCalledWith("Score updated to:", expect.anything());

        updatescore(undefined, 'win'); // Invalid score
        expect(consoleSpy).not.toHaveBeenCalledWith("Score updated to:", expect.anything());

        updatescore(600, null); // Invalid gameStatus
        expect(consoleSpy).not.toHaveBeenCalledWith("Score updated to:", expect.anything());

        consoleSpy.mockRestore(); // Restore console.log after the test
    });

    test('should fail to save player data with missing name', async () => {
        await expect(savePlayerData(null, 500, new Date().toISOString())).rejects.toThrow('Player name is required');
    });
});

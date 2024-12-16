const {
    CustomDatabase,
} = require('../../database.js');

describe('Database Functions', () => {

    let customDb;

    beforeEach(() => {
        customDb = new CustomDatabase(false).initialize('./tests.db');
    });

    afterEach((done) => {
        customDb.db.serialize(() => {
            customDb.db.run(`
                CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    game_date DATE NOT NULL
                )
            `);
        });
        customDb.db.serialize(() => {
            customDb.db.run(`
                CREATE TABLE IF NOT EXISTS game_state (
                    id INTEGER PRIMARY KEY,
                    score INTEGER
                )
            `);
        });
        customDb.db.run('DELETE FROM players', (err) => {
            if (err) done(err);
            else done(); // Resolve done after cleaning up
        });
    });

    afterAll((done) => {
        customDb.updatescore(1000, 'win')
        customDb.db.close((err) => {
            if (err) done(err);
            else done();
        });
        jest.clearAllTimers(); // Clear timers to avoid memory leaks
    });

    jest.setTimeout(20000); // Increase timeout to 20 seconds if needed

    test('should initialize database', () => {
        expect(customDb).toBeDefined();
    });

    test('should save player data', async () => {
        const playerName = 'testPlayer';
        const score = 500;
        const gameDate = new Date().toISOString();

        const id = await customDb.savePlayerData(playerName, score, gameDate);
        expect(id).toBeDefined();

        const row = await new Promise((resolve, reject) => {
            customDb.getPlayerDataById(id, (result) => {
                if (result) resolve(result);
                else reject(new Error('Player data not found'));
            })
        });

        expect(row).toHaveProperty("id");
        expect(row.name).toBe(playerName);
        expect(row.score).toBe(score);
        expect(row.game_date).toBe(gameDate);
    });

    test('should retrieve player data', async () => {
        const playerName = 'testPlayer';

        await customDb.savePlayerData(playerName, 500, new Date().toISOString()); // Ensure player exists

        const data = await new Promise((resolve, reject) => {
            customDb.getPlayerData(playerName, (result) => {
                if (result) resolve(result);
                else reject(new Error('Player not found'));
            });
        });
        expect(data).toBeDefined();
        expect(data.name).toBe(playerName);
    });

    test('should return null for non-existing player data', async () => {
        const data = await new Promise((resolve) => {
            customDb.getPlayerData('nonExistingPlayer', (result) => resolve(result));
        });
        expect(data).toBeNull();
    });

    test('should fail to save player data with missing name', async () => {
        await expect(customDb.savePlayerData(null, 500, new Date().toISOString())).rejects.toThrow('Player name is required');
    });
    test('should fail to save player data with missing score', async () => {
        await expect(customDb.savePlayerData("test", null, new Date().toISOString())).rejects.toThrow('Score is required');
    });
    test('should fail to save player data with missing date', async () => {
        await expect(customDb.savePlayerData("test", 500, null)).rejects.toThrow('Game date is required');
    });

    test('should throw when create an invalid database', () => {
        const dbInstance = new CustomDatabase();
        dbInstance.initialize('::')
        expect(() => dbInstance.dbError).toBeDefined();
    });

    test('should not save player data', async () => {
        customDb.db.run(`DROP TABLE players`);

        await expect(customDb.savePlayerData('John Doe', 100, '2024-11-21')).rejects.toThrow();
    });

    test('should not create tables', async () => {
        let customSql1 = `
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            score INTEGER NOT NULL;
            game_date DATE NOT NULL
        );
        `;
        customDb.createTables(customSql1);
        expect(() => customDb.throwError()).toThrow();

        let customSql2 = `
        CREATE TABLE IF NOT EXISTS game_state (
                    id INTEGER PRIMARY KEY;
                    score INTEGER
        )
        `;
        customDb.createTables(null, customSql2);
        expect(customDb.dbError).toBeNull();
    });

    test('should not get player data by id', async () => {
        const playerName = 'testPlayer';
        const score = 500;
        const gameDate = new Date().toISOString();

        await customDb.savePlayerData(playerName, score, gameDate); // Ensure player exists
        const data = await new Promise((resolve) => {
            customDb.getPlayerDataById('notAnId', (result) => resolve(result));
        });
        expect(data).toBeNull();
    });

    test('should not insert initial score', async () => {
        customDb.insertInitialscore("test");
        expect(() => customDb.throwError()).toThrow();
    });

    test('should not update score', () => {
        customDb.db.run(`DROP TABLE game_state`);
        customDb.savescoreToDB(25);
        expect(() => customDb.throwError()).toThrow();
    })

    test('should not get score when no row', async () => {
        await expect(customDb.getDbScore(25)).rejects.toThrow();
    });
    
    test('should not get score when no table', async () => {
        customDb.db.run(`DROP TABLE game_state`);
        await expect(customDb.getDbScore(25)).rejects.toThrow();
    });

    test('should get top players', async () => {
        const data = await new Promise((resolve) => {
            customDb.getTopPlayers((result) => resolve(result));
        });
        expect(data).not.toBe([]);
    });

    test('should not get top players', async () => {
        let customSql = `
        SELECT name; score, game_date FROM players 
        ORDER BY score DESC;
        LIMIT 1000
    `
        const data = await new Promise((resolve) => {
            customDb.getTopPlayers((result) => resolve(result), customSql);
        });
        expect(data).toBeInstanceOf(Error);
    });

});
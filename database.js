const sqlite3 = require('sqlite3').verbose();
class CustomDatabase {
    constructor(logging = true) {
        this.dbError = null;
        this.db = null;
        this.shouldLog = logging;
    }

    initialize = (path) => {
        this.db = new sqlite3.Database(path, (err) => {
            if (err) {
                this.shouldLog ? this.dbError = new Error('Could not connect to the database') : null;
            } else {
                this.shouldLog ? console.log('Connected to the SQLite database') : null;
                this.shouldLog ? console.log('Creating tables...') : null;
                this.createTables(); // Créer les tables nécessaires
            }
        });
        return this;
    };

    createTables = (custom1 = null, custom2 = null) => {
        this.db.serialize(() => {
            this.db.run(custom1 ? custom1 : `
                CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    score INTEGER,
                    game_date TEXT
                )
            `, (err) => {
                if (err) {
                    this.dbError = new Error("Failed to create players table");
                } else {
                    this.shouldLog ? console.log("Players table created or already exists") : null;
                }
            });

            this.db.run(custom2 ? custom2 : `
                CREATE TABLE IF NOT EXISTS game_state (
                    id INTEGER PRIMARY KEY,
                    score INTEGER
                )
            `, (err) => {
                if (err) {
                    this.shouldLog ? console.error("Failed to create game_state table", err) : null;
                    this.dbError = new Error("Failed to create game_state table");
                } else {
                    this.shouldLog ? console.log("Game state table created or already exists") : null;
                    this.insertInitialscore();
                }
            });
        });
        return this;
    };

    // Insérer une valeur initiale pour le score
    insertInitialscore = (initialScore = 1000) => {
        this.db.run(`INSERT OR IGNORE INTO game_state (id, score) VALUES (1, ${initialScore})`, (err) => {
            if (err) {
                this.shouldLog ? console.error("Failed to insert initial score", err) : null;
                this.dbError = new Error("Failed to insert initial score");
            } else {
                this.shouldLog ? console.log("Initial score inserted into game_state.") : null;
            }
        });
        return this;
    };

    savePlayerData = (name, score, gameDate) => {
        console.log(name, score, gameDate);
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO players (name, score, game_date) VALUES (?, ?, ?)`;
            if (!name || !score || !gameDate) {
                let result = "";
                if (!name) result = "Player name is required";
                if (!score) result = "Score is required";
                if (!gameDate) result = "Game date is required";
                reject(new Error(result));
            }
            else {
                this.db.run(sql, [name, score, gameDate], function (err) {
                    if (err) {
                       reject(new Error(err));
                    }
                    else {
                        resolve(this.lastID);
                    }
                });
            }
        });
    };

    // Récupérer les données du joueur
    getPlayerData = (playerName, callback) => {
        this.db.get(`
        SELECT * FROM players WHERE name = ? ORDER BY game_date DESC LIMIT 1
    `, [playerName], (err, row) => {
            if (err || row == undefined) {
                err ? console.error("Error retrieving player data", err) : null;
                callback(null);
            } else {
                callback(row);
            }
        });
    };

    getPlayerDataById = (id, callback) => {
        this.db.get(`SELECT * FROM players WHERE id = ? ORDER BY game_date DESC LIMIT 1`
            , [id], (err, row) => {
                if (err || row == undefined) {
                    err ? this.shouldLog ? console.error("Error retrieving player data", err) : null : null;
                    callback(null);
                } else {
                    callback(row);
                }
            });
    };

    updatescore = (score, gameStatus) => {
        if (gameStatus === 'win') {
            this.db.run(`UPDATE game_state SET score = ? WHERE id = 1`, [score], (err) => {
                if (err) {
                    this.shouldLog ? console.error("Failed to update score", err) : null;
                    this.dbError = new Error("Failed to update score");
                } else {
                    this.shouldLog ? console.log(`Score updated to: ${score}`) : null;
                }
            });
        } else {
            this.shouldLog ? console.log("Game is not won, score not updated.") : null;
        }
    };

    // Sauvegarder le score dans la base de données
    savescoreToDB = (score) => {
        this.shouldLog ? console.log(`Saving score to DB: ${score}`) : null;
        this.updatescore(score, 'win');
    };

    getDbScore = async (id = 1) => {
        let row = await new Promise((resolve, reject) => {
            this.db.get(`SELECT score FROM game_state WHERE id = ${id}`, (err, row) => {
                if (err || row == undefined) {
                    err ? reject(new Error(err)) : reject(new Error("No score found in DB"));
                }
                else {
                    resolve(row);
                }
            });
        });
        return row.score;
    }

    // Récupérer les meilleurs joueurs
    getTopPlayers = (callback, customSql = null) => {
        this.db.all(customSql ? customSql : `
        SELECT name, score, game_date FROM players 
        ORDER BY score DESC 
        LIMIT 1000
    `, [], (err, rows) => {
            if (err) {
                this.shouldLog ? console.error("Error retrieving top players", err) : null;
                callback(new Error("Error retrieving top players"));
            } else {
                callback(rows);
            }
        });
    };

    throwError = () => {
        throw this.dbError;
    };
}

module.exports = {
    CustomDatabase,
};

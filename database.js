const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./players.db', (err) => {
    if (err) {
        console.error('Could not connect to the database', err);
    } else {
        console.log('Connected to the SQLite database');
        createTables(); // Créer les tables nécessaires
    }
});

// Créer les tables si elles n'existent pas
const createTables = () => {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                score INTEGER,
                game_date TEXT
            )
        `, (err) => {
            if (err) {
                console.error("Failed to create players table", err);
            } else {
                console.log("Players table created or already exists");
            }
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS game_state (
                id INTEGER PRIMARY KEY,
                score INTEGER
            )
        `, (err) => {
            if (err) {
                console.error("Failed to create game_state table", err);
            } else {
                console.log("Game state table created or already exists");
                insertInitialscore();
            }
        });
    });
};

// Insérer une valeur initiale pour le score
const insertInitialscore = () => {
    db.run(`INSERT OR IGNORE INTO game_state (id, score) VALUES (1, 1000)`, (err) => {
        if (err) {
            console.error("Failed to insert initial score", err);
        } else {
            console.log("Initial score inserted into game_state.");
        }
    });
};

const savePlayerData = (name, score, gameDate) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO players (name, score, game_date) VALUES (?, ?, ?)`;
        if(!name || !score || !gameDate )
        {
            let result = "";
            if(!name) result="Player name is required";
            if(!score) result="Score is required";
            if(!gameDate) result="Game date is required";
            return reject(new Error(result));
        }
        db.run(sql, [name, score, gameDate], function(err) {
            if (err) {
                return reject(err);
            }
            resolve(this.lastID);
        });
    });
};



// Sauvegarder le pseudo du joueur
const saveUsername = (req, res) => {
    const username = req.body.name; // Le pseudo
    const score = req.body.score; // Le score
    const game_date = new Date().toISOString(); // Date actuelle

    console.log(`Saving player: ${username}, Score: ${score}, Date: ${game_date}`); // Ajoutez un log pour déboguer

    // SQL pour insérer les données
    const query = 'INSERT INTO players (name, score, game_date) VALUES (?, ?, ?)';
    
    db.run(query, [username, score, game_date], function(err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send('Database error');
        }
        console.log(`Player ${username} saved successfully!`); // Log pour confirmer l'enregistrement
        res.redirect('/'); 
    });
};

// Récupérer les données du joueur
const getPlayerData = (playerName, callback) => {
    db.get(`
        SELECT * FROM players WHERE name = ? ORDER BY game_date DESC LIMIT 1
    `, [playerName], (err, row) => {
        if (err || row == undefined) {
            console.error("Error retrieving player data", err);
            callback(null);
        } else {
            callback(row);
        }
    });
};

const updatescore = (score, gameStatus) => {
    return new Promise((resolve) => {  // Return a Promise
        if (gameStatus === 'win') {  
            db.run(`UPDATE game_state SET score = ? WHERE id = 1`, [score], (err) => {
                if (err) {
                    console.error("Failed to update score", err);
                    resolve();
                } else {
                    console.log(`Score updated to: ${score}`); 
                    resolve();
                }
            });
        } else {
            console.log("Game is not won, score not updated.");
            resolve();
        }
    });
};

// Sauvegarder le score dans la base de données
const savescoreToDB = (score) => {
    console.log(`Saving score to DB: ${score}`);
    updatescore(score, 'win');
};

const getDbScore = async () => {
    let row = await new Promise((resolve, reject) => {
        db.get(`SELECT score FROM gamestate WHERE id = 1`, (err,row) => {
            if(err || row == undefined) {
                err ? reject(new Error (err)) : reject(new Error("No score found in DB"));
            }
            else {
                resolve(row);
            }
        });
    });
    return row.score;
}

// Récupérer les meilleurs joueurs
const getTopPlayers = (callback) => {
    db.all(`
        SELECT name, score, game_date FROM players 
        ORDER BY score DESC 
        LIMIT 1000
    `, [], (err, rows) => {
        if (err) {
            console.error("Error retrieving top players", err);
            callback([]);
        } else {
            callback(rows);
        }
    });
};

module.exports = {
    savePlayerData,
    getPlayerData,
    updatescore,
    getDbScore,
    saveUsername,
    getTopPlayers,
    savescoreToDB
};

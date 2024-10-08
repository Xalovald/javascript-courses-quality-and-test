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
                insertInitialscore(); // Insérer le score initial si nécessaire
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

// Sauvegarder les données du joueur
const savePlayerData = (playerName, score, gameDate) => {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO players (name, score, game_date) 
            VALUES (?, ?, ?)
        `, [playerName, score, gameDate], function(err) {
            if (err) {
                console.error("Failed to insert player data", err);
                reject(err); // Gestion d'erreur si l'insertion échoue
            } else {
                console.log(`Player data saved with ID: ${this.lastID}`);
                resolve(this.lastID); // Résoudre avec l'ID du joueur inséré
            }
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
        if (err) {
            console.error("Error retrieving player data", err);
            callback(null);
        } else {
            callback(row);
        }
    });
};

// Mettre à jour le score seulement si le joueur gagne
const updatescore = (score, gameStatus) => {
    if (gameStatus === 'win') {  // Vérifier si le joueur a gagné
        db.run(`
            UPDATE game_state SET score = ? WHERE id = 1
        `, [score], (err) => {
            if (err) {
                console.error("Failed to update score", err);
            } else {
                console.log(`Score updated to: ${score}`);
            }
        });
    } else {
        console.log("Game is not won, score not updated.");
    }
};

// Sauvegarder le score dans la base de données
const savescoreToDB = (score) => {
    console.log(`Saving score to DB: ${score}`); // Log du score pour vérification
    updatescore(score, 'win'); // Mise à jour dans la base de données avec statut 'win'
};

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
            callback(rows); // Renvoie les joueurs récupérés
        }
    });
};

module.exports = {
    savePlayerData,
    getPlayerData,
    updatescore,  // Mise à jour de la fonction updateScore avec gameStatus
    saveUsername,
    getTopPlayers,
    savescoreToDB
};

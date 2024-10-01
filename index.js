const express = require('express');
const path = require('path');
const Game = require('./game.js'); // Importer la logique du jeu
const { savePlayerData, getPlayerData, updatescore, getTopPlayers } = require('./database.js'); // Gérer la persistance
const sqlite3 = require('sqlite3').verbose(); // Base de données SQLite
require('dotenv').config();

const PORT = process.env.PORT || 3030;
const app = express();
const game = new Game(); // Initialiser le jeu

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./game.db', (err) => {
    if (err) {
        console.error('Failed to connect to the database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Fonction pour charger le score de la base de données
const loadscoreFromDB = (callback) => {
    db.get('SELECT score FROM game_state WHERE id = 1', (err, row) => {
        if (err) {
            console.error('Error retrieving score:', err.message);
            callback(null);
        } else {
            callback(row ? row.score : null);
        }
    });
};

// Fonction pour sauvegarder le score dans la base de données
const savescoreToDB = (score) => {
    updatescore(score); // Mise à jour dans la base de données
};

// Charger les mots et initialiser le jeu avec un score persistant
app.get('/', (req, res) => {
    game.loadWords().then(() => {
        loadscoreFromDB((savedscore) => {
            if (savedscore !== null) {
                game.setscore(savedscore); // Charger le score sauvegardé
            } else {
                game.startscore(); // Démarrer un nouveau score si aucun n'est sauvegardé
            }

            res.render('pages/index', {
                game: game.print(),
                word: game.word, // Cacher plus tard pour production
                numberOfTries: game.getNumberOfTries(),
                score: game.getscore(),
                status: game.checkGameStatus(),
                lettersTried: game.getLettersTried()
            });
        });
    }).catch((error) => {
        console.error('Error loading game:', error.message);
        res.status(500).send('An error occurred while loading the game');
    });
});

// Sauvegarder le score à intervalle régulier
setInterval(() => {
    const currentscore = game.getscore();
    savescoreToDB(currentscore); // Sauvegarde du score
}, 1000); // Sauvegarde toutes les secondes

// Route POST pour gérer les actions du joueur (deviner une lettre ou réinitialiser)
app.post('/', (req, res) => {
    try {
        let status = 'continue';

        if (req.body.reset) {
            game.reset();
            savescoreToDB(game.getscore()); // Sauvegarder le score réinitialisé
        } else if (req.body.word) {
            game.guess(req.body.word);
            status = game.checkGameStatus();
        }

        res.render('pages/index', {
            game: game.print(),
            word: game.word,
            numberOfTries: game.getNumberOfTries(),
            score: game.getscore(),
            status: status,
            lettersTried: game.getLettersTried()
        });
    } catch (error) {
        console.error('Error handling player input:', error.message);
        res.status(500).send("An error occurred: " + error.message);
    }
});

// Route pour obtenir les informations d'un joueur
app.get('/player/:name', (req, res) => {
    const playerName = req.params.name;

    getPlayerData(playerName, (data) => {
        if (data) {
            res.render('pages/player', {
                name: data.name,
                score: data.score,
                lettersTried: data.letters_tried,
                gameDate: data.game_date
            });
        } else {
            res.status(404).send('No data found for this player');
        }
    });
});

app.post('/save-username', (req, res) => {
    const username = req.body.name; // Get the username from the form
    const score = req.body.score; // Get the score from the form; ensure this is sent from the client
    const game_date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format

    // Call the saveUsername function
    savePlayerData(username, score, "", game_date) // Pass empty string for letters_tried or modify accordingly
        .then(() => {
            res.redirect('/'); // Redirect to the main page after saving
        })
        .catch(err => {
            console.error("Error saving username:", err);
            res.status(500).send('Error saving username');
        });
});


// Route to get top players
app.get('/top-players', (req, res) => {
    getTopPlayers((players) => {
        res.json(players); // Send the top players as JSON response
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

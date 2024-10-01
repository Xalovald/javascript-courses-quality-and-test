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
                gameDate: data.game_date
            });
        } else {
            res.status(404).send('No data found for this player');
        }
    });
});

app.post('/save-username', (req, res) => {
    const username = req.body.name;  // Récupérer le nom d'utilisateur
    const score = req.body.score;    // Récupérer le score
    const game_date = new Date().toISOString().split('T')[0]; // Date actuelle

    // Appeler la fonction pour sauvegarder les données du joueur
    savePlayerData(username, score, game_date)
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            console.error("Error saving username and score:", err);
            res.status(500).send('Error saving username and score');
        });
});


// Route to get top players
app.get('/top-players', (req, res) => {
    getTopPlayers((players) => {
        if (players) {
            console.log('Top players:', players); // Log des joueurs récupérés
            res.json(players); // Renvoie les joueurs sous forme de JSON
        } else {
            console.error('Erreur lors de la récupération des joueurs');
            res.status(500).send('Erreur lors de la récupération des meilleurs joueurs.');
        }
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
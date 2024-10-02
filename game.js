const { savePlayerData, getPlayerData, updatescore } = require('./database.js');
const tools = require('./tools.js');
const csv = require('csv-parser');
const fs = require('fs');

class Game {

    constructor() {
        this.listOfWords = [];
        this.numberOfTry = 5;
        this.initialscore = 1000; // score starts at 1000 seconds
        this.score = this.initialscore;
        this.scoreIntervalId = null;
        this.startTime = null;
        this.penaltyTime = 50; // Time to subtract for incorrect guesses
        this.isGameOver = false;
        this.status = 'continue'; // Initial game status
        this.lettersTried = [];
    }

    loadWords() {
        return new Promise((resolve, reject) => {
            fs.createReadStream('words_fr.txt')
                .pipe(csv())
                .on('data', (row) => {
                    this.listOfWords.push(row.word.toLowerCase());
                })
                .on('end', () => {
                    console.log('CSV file successfully processed');
                    this.chooseWord();
                    resolve();
                })
                .on('error', reject);
        });
    }

    checkGameStatus() {
        // Check if the player has found all the letters in the word
        if (this.unknowWord === this.word) {
            this.isGameOver = true;
            return 'win'; // The player wins
        }

        // Check if the player has no tries left
        if (this.numberOfTry <= 0) {
            this.isGameOver = true;
            return 'lose'; // The player loses
        }

        return 'continue'; // The game continues
    }

    chooseWord() {
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');

        if (this.listOfWords.length > 0) {
            const dateHash = parseInt(today, 10);
            const index = dateHash % this.listOfWords.length;

            this.word = this.listOfWords[index];
            this.unknowWord = this.word.replace(/./g, '#');
        } else {
            throw new Error("No words available to choose from.");
        }
    }

    guess(letter) {
        if (!this.word) {
            throw new Error("Le mot n'a pas été défini.");
        }

        if (this.isGameOver) {
            return false; // Ne pas autoriser de nouvelles tentatives si le jeu est terminé
        }

        let found = false;
        let position = this.word.indexOf(letter);

        while (position !== -1) {
            this.unknowWord = tools.replaceAt(this.unknowWord, position, letter);
            found = true;
            position = this.word.indexOf(letter, position + 1);
        }

        if (!found) {
            this.numberOfTry--;
            this.initialscore = this.score -= this.penaltyTime;
        }

        // Ajoutez la lettre dans le tableau des lettres essayées si elle n'y est pas déjà
        if (!this.lettersTried.includes(letter)) {
            this.lettersTried.push(letter);
        }

        return found;
    }

    // Méthode pour récupérer les lettres essayées
    getLettersTried() {
        return this.lettersTried.join(', ');
    }


    print() {
        return this.unknowWord;
    }

    getNumberOfTries() {
        return this.numberOfTry;
    }

    reset() {
        this.numberOfTry = 5;
        this.score = this.initialscore; // Reset score
        this.isGameOver = false; // Reset game over status
        this.chooseWord();
        return this.numberOfTry;
    };

    startscore() {
        this.startTime = Date.now(); // Initialize start time
        this.scoreIntervalId = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.score = this.initialscore - elapsedTime;
    
            // Vérifiez l'état du jeu à chaque intervalle
            const status = this.checkGameStatus();
            
            if (status === 'win') {
                // Mettre à jour le score dans la base de données uniquement si le joueur a gagné
                updatescore(this.score, status);
                clearInterval(this.scoreIntervalId); // Stop the score
                this.isGameOver = true; // Mark the game as over
                console.log("Game won! Score saved and timer stopped.");
            } else if (status === 'lose') {
                clearInterval(this.scoreIntervalId); // Stop the score
                this.isGameOver = true; // Mark the game as over
                console.log("Game lost! Timer stopped.");
            } else if (this.score <= 0) {
                this.score = 0;
                clearInterval(this.scoreIntervalId);
                this.isGameOver = true;
                console.log("Score finished! You cannot play until the next day.");
            }
        }, 1000);
    }
    
    getscore() {
        return this.score;
    }
    
    getStatus() {
        return this.status;
    }
}
module.exports = Game;
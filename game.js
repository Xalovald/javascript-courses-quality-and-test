const { savePlayerData, getPlayerData, updatescore } = require('./database.js');
const tools = require('./tools.js');
const csv = require('csv-parser');
const fs = require('fs');

class Game {

    constructor() {
        this.listOfWords = [];
        this.numberOfTry = 5;
        this.initialscore = 1000; 
        this.score = this.initialscore;
        this.scoreIntervalId = null;
        this.startTime = null;
        this.penaltyTime = 50;
        this.isGameOver = false;
        this.status = 'continue'; 
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
        if (this.unknowWord === this.word) {
            this.isGameOver = true;
            return 'win'; 
        }

        if (this.numberOfTry <= 0) {
            this.isGameOver = true;
            return 'lose';
        }

        return 'continue'; 
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
            return false; // If the game is over, no more guesses are allowed
        }
    
        // Convert the guessed letter to lowercase for comparison
        const lowerCaseLetter = letter.toLowerCase();
    
        // Check if the letter has already been guessed
        if (this.lettersTried.includes(lowerCaseLetter)) {
            return false; // Letter already tried
        }
    
        // If the letter hasn't been guessed yet, add it to the tried letters
        this.lettersTried.push(lowerCaseLetter);
    
        const lowerCaseWord = this.word.toLowerCase(); // Convert the word to lowercase for comparison
        let found = false;
        let position = lowerCaseWord.indexOf(lowerCaseLetter); // Use the lowercase word for searching
    
        while (position !== -1) {
            this.unknowWord = tools.replaceAt(this.unknowWord, position, letter); // Keep the original letter case in unknowWord
            found = true;
            position = lowerCaseWord.indexOf(lowerCaseLetter, position + 1); // Continue searching in the lowercase word
        }
    
        if (!found) {
            this.numberOfTry--;
            this.initialscore = this.score -= this.penaltyTime;
        }
    
        return found; // Return whether the letter was found in the word
    }
       

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
        this.score = this.initialscore; 
        this.isGameOver = false;
        this.chooseWord();
        return this.numberOfTry;
    };

    startscore() {
        this.startTime = Date.now();
        this.scoreIntervalId = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.score = this.initialscore - elapsedTime;
    
            const status = this.checkGameStatus();
            
            if (status === 'win') {
                updatescore(this.score, status);
                clearInterval(this.scoreIntervalId); 
                this.isGameOver = true;
                console.log("Game won! Score saved and timer stopped.");
            } else if (status === 'lose') {
                clearInterval(this.scoreIntervalId); 
                this.isGameOver = true;
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
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
                    resolve(this.listOfWords);
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
            this.hashWord();
        } else {
            throw new Error("No words available to choose from.");
        }
    }

    hashWord(){
        this.unknowWord = this.word.replace(/./g, '#');
    }

    guess(letter) {
        if (!this.word) {
            throw new Error("Le mot n'a pas été défini.");
        }
    
        if (this.isGameOver) {
            return false; 
        }
    
        const lowerCaseLetter = letter.toLowerCase();
    
        
        if (this.lettersTried.includes(lowerCaseLetter)) {
            return false;
        }

        this.lettersTried.push(lowerCaseLetter);
    
        const lowerCaseWord = this.word.toLowerCase(); 
        let found = false;
        let position = lowerCaseWord.indexOf(lowerCaseLetter); 
    
        while (position !== -1) {
            this.unknowWord = tools.replaceAt(this.unknowWord, position, letter); 
            found = true;
            position = lowerCaseWord.indexOf(lowerCaseLetter, position + 1);
        }
    
        if (!found) {
            this.numberOfTry--;
            this.initialscore = this.score -= this.penaltyTime;
        }
    
        return found;
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
        }, 1000).unref();
    }
    
    getscore() {
        return this.score;
    }
    
    getStatus() {
        return this.status;
    }
}
module.exports = Game;
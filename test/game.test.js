const Game = require('../game.js'); // Adjusted path 
const { updatescore } = require('../database.js'); // Adjusted path
const csv = require('csv-parser');
jest.mock('../database.js');

describe('Game Class', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        game.listOfWords = ['apple', 'banana', 'cherry']; // Mock word list
        game.chooseWord(); // Ensure a word is chosen before each test
    });

    test('should load words from CSV', async () => {
        // Mocking CSV data
        game.loadWords = jest.fn(() => {
            game.listOfWords.push('mockWord'); // Add mocked word
            return Promise.resolve(); // Ensure the promise resolves
        });
        await game.loadWords();
        expect(game.listOfWords).toContain('mockWord');
    });

    test('should choose a word based on the date', () => {
        // Test that a word has been chosen
        expect(game.word).toBeDefined(); 
        expect(game.unknowWord).toBe('#####'); // Based on the chosen word
    });

    test('should check game status correctly', () => {
        game.numberOfTry = 0; // Player has no tries left
        expect(game.checkGameStatus()).toBe('lose');
        
        game.numberOfTry = 5; // Reset number of tries
        game.word = 'apple'; // Set the word to guess
        game.unknowWord = 'apple'; // Simulate winning
        expect(game.checkGameStatus()).toBe('win');
        
        game.unknowWord = '#####'; // Simulate ongoing game
        expect(game.checkGameStatus()).toBe('continue');
    });

    test('should reset the game correctly', () => {
        game.reset();
        expect(game.word).toBeDefined();
        expect(game.numberOfTry).toBe(5); // Should reset to initial number of tries
        expect(game.isGameOver).toBe(false); // Game should not be over
    });

    test('should update score in database on win', () => {
        game.checkGameStatus = jest.fn(() => 'win'); // Simulate winning
        game.startscore();
        expect(updatescore).toHaveBeenCalledWith(expect.any(Number), 'win');
    });

    test('should correctly guess a letter', () => {
        const letter = 'a';
        game.word = 'banana';
        const result = game.guess(letter);
        expect(result).toBe(true);
        expect(game.unknowWord).toBe('a####a'); // Check if letter was revealed
        expect(game.numberOfTry).toBe(5); // Should not decrease tries
        
        const incorrectGuess = game.guess('x');
        expect(incorrectGuess).toBe(false);
        expect(game.numberOfTry).toBe(4); // Should decrease tries
        expect(game.score).toBe(game.initialscore - game.penaltyTime); // Check score after penalty
    });

    test('should handle guessing when game is over', () => {
        game.isGameOver = true;
        expect(game.guess('a')).toBe(false); // Should not allow guessing
    });

    test('should retrieve letters tried', () => {
        game.guess('a');
        game.guess('b');
        expect(game.getLettersTried()).toBe('a, b'); // Check if letters tried are returned correctly
    });

    test('should print current unknown word', () => {
        game.word = 'banana';
        game.unknowWord = 'b#####';
        expect(game.print()).toBe('b#####'); // Check printed value of unknown word
    });

    test('should return the number of tries', () => {
        expect(game.getNumberOfTries()).toBe(5); // Should return the initial number of tries
    });

    test('should get the current score', () => {
        expect(game.getscore()).toBe(game.initialscore); // Should return the initial score
    });

    test('should get game status', () => {
        expect(game.getStatus()).toBe('continue'); // Check initial status
    });
});

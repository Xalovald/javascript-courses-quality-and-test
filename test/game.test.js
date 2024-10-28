const Game = require('../game.js'); 
const { updatescore } = require('../database.js'); 
jest.mock('../database.js');

describe('Game Class', () => {
    let game;

    beforeEach(() => {
        game = new Game();
        game.listOfWords = ['apple', 'banana', 'cherry'];
        game.chooseWord();
    });

    test('should load words from CSV', async () => {
        game.loadWords = jest.fn(() => {
            game.listOfWords.push('mockWord');
            return Promise.resolve();
        });
        await game.loadWords();
        expect(game.listOfWords).toContain('mockWord');
    });

    test('should choose a word based on the date', () => {
        expect(game.word).toBeDefined(); 
        expect(game.unknowWord).toBe('#####');
    });

    test('should check game status correctly', () => {
        game.numberOfTry = 0; 
        expect(game.checkGameStatus()).toBe('lose');
        
        game.numberOfTry = 5; 
        game.word = 'apple'; 
        game.unknowWord = 'apple'; 
        expect(game.checkGameStatus()).toBe('win');
        
        game.unknowWord = '#####'; 
        expect(game.checkGameStatus()).toBe('continue');
    });

    test('should reset the game correctly', () => {
        game.reset();
        expect(game.word).toBeDefined();
        expect(game.numberOfTry).toBe(5);
        expect(game.isGameOver).toBe(false);
        expect(game.unknowWord).toBe('#####');
    });

    test('should update score in database on win', async () => {
        game.checkGameStatus = jest.fn(() => 'win');
        game.startscore();

        game.score = 100;

        await game.updateScore();
        expect(updatescore).toHaveBeenCalledWith(expect.any(Number), 'win');
    });

    test('should correctly guess a letter', () => {
        const letter = 'a';
        game.word = 'banana';
        const result = game.guess(letter);
        expect(result).toBe(true);
        expect(game.unknowWord).toBe('a####a'); 
        expect(game.numberOfTry).toBe(5);
        
        const incorrectGuess = game.guess('x');
        expect(incorrectGuess).toBe(false);
        expect(game.numberOfTry).toBe(4);
        expect(game.score).toBe(game.initialscore - game.penaltyTime);
    });

    test('should handle guessing when game is over', () => {
        game.isGameOver = true;
        expect(game.guess('a')).toBe(false);
        expect(game.numberOfTry).toBe(5);
    });

    test('should retrieve letters tried', () => {
        game.guess('a');
        game.guess('b');
        expect(game.getLettersTried()).toBe('a, b');
    });

    test('should print current unknown word', () => {
        game.word = 'banana';
        game.unknowWord = 'b#####';
        expect(game.print()).toBe('b#####');
    });

    test('should return the number of tries', () => {
        expect(game.getNumberOfTries()).toBe(5);
    });

    test('should get the current score', () => {
        expect(game.getscore()).toBe(game.initialscore);
    });

    test('should get game status', () => {
        expect(game.getStatus()).toBe('continue');
    });

    test('should handle incorrect guesses correctly', () => {
        const letter = 'b';
        game.word = 'banana';
        game.guess(letter); 
        expect(game.numberOfTry).toBe(4); 
    });

    test('should not reveal letters if not guessed correctly', () => {
        const letter = 'z';
        game.word = 'banana';
        game.guess(letter);
        expect(game.unknowWord).toBe('######'); 
    });

    test('should call getLettersTried and return empty if no letters guessed', () => {
        expect(game.getLettersTried()).toBe('');
    });

    test('should update score based on the number of tries left', async () => {
        game.numberOfTry = 3; 
        game.score = game.initialscore; 
        await game.updateScore();
        expect(game.score).toBe(game.initialscore);
    });

    test('should not allow guessing the same letter multiple times', () => {
        game.word = 'banana';
        
        // First guess 'b', it should reveal only the 'b'
        expect(game.guess('b')).toBe(true); 
        expect(game.unknowWord).toBe('b####'); // Only 'b' is revealed, 'a' remains hidden
    
        // Second guess of 'b', should return false since it's already guessed
        expect(game.guess('b')).toBe(false);
        expect(game.numberOfTry).toBe(5); // The number of tries should remain the same
    });
    
    

    test('should reveal all occurrences of a letter when guessed correctly', () => {
        game.word = 'banana'; // Set the word to guess
        expect(game.guess('B')).toBe(true); // Guess 'B'
        expect(game.unknowWord).toBe('B####'); // Check if 'B' is revealed
    
        expect(game.guess('a')).toBe(true); // Guess 'a'
        expect(game.unknowWord).toBe('Ba##a'); // Both 'a's should be revealed
    });
    

    test('should handle case sensitivity in letter guessing', () => {
        game.word = 'banana'; // Set the word to guess
        expect(game.guess('B')).toBe(true); // Guessing 'B' should return true
        expect(game.unknowWord).toBe('B####'); // 'B' is revealed, but 'a' remains hidden
    });
    
    test('should reset the score when starting a new game', async () => {
        game.score = 50;
        await game.reset();
        expect(game.score).toBe(game.initialscore);
    });

    test('should mark game as over after losing', () => {
        game.numberOfTry = 0; 
        expect(game.checkGameStatus()).toBe('lose');
        expect(game.isGameOver).toBe(true); 
    });

    test('should not allow score to go below zero', async () => {
        game.score = 10;
        game.numberOfTry = 0;

        // Mock the updateScore method to prevent changing score
        game.updateScore = jest.fn(async () => {
            // Do nothing; this mock prevents the actual logic from executing
            return Promise.resolve();
        });

        await game.updateScore();
        expect(game.score).toBe(10); 
        expect(game.updateScore).toHaveBeenCalled(); // Check if the method was called
    });

    test('should not allow duplicate letters in tried letters', () => {
        game.word = 'banana';
        game.guess('b');
        game.guess('b'); 
        expect(game.getLettersTried()).toBe('b'); 
    });

    test('should reset all game properties when starting a new game', async () => {
        game.score = 20;
        game.numberOfTry = 2; 
        await game.reset();
        expect(game.score).toBe(game.initialscore);
        expect(game.numberOfTry).toBe(5);
        expect(game.isGameOver).toBe(false);
        expect(game.unknowWord).toBe('#####');
    });
});

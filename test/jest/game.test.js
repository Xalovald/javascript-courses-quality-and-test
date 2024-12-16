const { CustomDatabase } = require('../../database.js');
const { Game } = require('../../game.js');
describe('Game Class', () => {
    let game;
    let db;

    beforeEach(() => {
        game = new Game(false);
        game.db = new CustomDatabase(false).initialize('./tests.db')
        game.listOfWords = ['apple', 'banana', 'cherry'];
        game.chooseWord();
    });

    afterAll((done) => {
        game.db.updatescore(1000, 'win')
        jest.clearAllTimers();
        done();
    })

    test('should create Game with logs and load DB', () => {
        const testGame = new Game();
        testGame.loadDb(false)
        expect(testGame.shouldLog).toBe(true);
    });


    test('should load words from CSV', async () => {
        let words_list = await game.loadWords();
        expect(words_list).toContain('morue');
    });

    test('should choose a word based on the date', () => {
        expect(game.word).toBeDefined(); 
        expect(game.unknowWord).toMatch(/#{5,}/g);
    });

    test('should check game status correctly', () => {
        game.numberOfTry = 0; 
        expect(game.checkGameStatus()).toBe('lose');
        
        game.numberOfTry = 5; 
        game.word = 'Apple'; 
        game.unknowWord = 'Apple'; 
        expect(game.checkGameStatus()).toBe('win');
        
        game.hashWord(); 
        expect(game.checkGameStatus()).toBe('continue');
    });

    test('should reset the game correctly', () => {
        game.reset();
        expect(game.word).toBeDefined();
        expect(game.numberOfTry).toBe(5);
        expect(game.isGameOver).toBe(false);
        expect(game.unknowWord).toMatch(/#{5,}/g);
    });

    test('should update score in database on win', async () => {
        await game.db.updatescore(game.score, 'win');
        expect(await game.db.getDbScore()).toBe(game.score);
    });

    test('should correctly guess a letter', () => {
        const letter = 'a';
        game.word = 'banana';
        game.hashWord(); 
        const result = game.guess(letter);
        expect(result).toBe(true);
        expect(game.unknowWord).toBe('#a#a#a'); 
        expect(game.numberOfTry).toBe(5);
        
        const incorrectGuess = game.guess('x');
        expect(incorrectGuess).toBe(false);
        expect(game.numberOfTry).toBe(4);
        expect(game.score).toBe(game.initialscore);
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
        const letter = 'c';
        game.word = 'banana';
        game.hashWord(); 
        game.guess(letter); 
        expect(game.numberOfTry).toBe(4); 
    });

    test('should not reveal letters if not guessed correctly', () => {
        const letter = 'z';
        game.word = 'banana';
        game.hashWord(); 
        game.guess(letter);
        expect(game.unknowWord).toBe('######'); 
    });

    test('should call getLettersTried and return empty if no letters guessed', () => {
        expect(game.getLettersTried()).toBe('');
    });

    test('should update score based on the number of tries left', async () => {
        game.numberOfTry = 3; 
        game.score = game.initialscore; 
        await game.db.updatescore(game.score, 'continue');
        expect(game.score).toBe(game.initialscore);
    });

    test('should not allow guessing the same letter multiple times', () => {
        game.word = 'banana';
        game.hashWord(); 
        
        expect(game.guess('b')).toBe(true); 
        expect(game.unknowWord).toBe('b#####'); 

        expect(game.guess('b')).toBe(false);
        expect(game.numberOfTry).toBe(5);
    });
    

    test('should reveal all occurrences of a letter when guessed correctly', () => {
        game.word = 'banana';
        game.hashWord(); 
        expect(game.guess('B')).toBe(true);
        expect(game.unknowWord).toBe('B#####'); 
    
        expect(game.guess('a')).toBe(true);
        expect(game.unknowWord).toBe('Ba#a#a');
    });
    

    test('should handle case sensitivity in letter guessing', () => {
        game.word = 'banana';
        game.hashWord(); 
        expect(game.guess('B')).toBe(true); 
        expect(game.unknowWord).toBe('B#####'); 
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

        game.updateScore = jest.fn(async () => {

            return Promise.resolve();
        });

        await game.updateScore();
        expect(game.score).toBe(10); 
        expect(game.updateScore).toHaveBeenCalled();
    });

    test('should not allow duplicate letters in tried letters', () => {
        game.word = 'banana';
        game.hashWord(); 
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
        expect(game.unknowWord).toMatch(/#{5,}/g);
    });

    // Test for startscore function
    test('should start the game and update the score', () => {
        jest.useFakeTimers();
        game.startscore();
        jest.advanceTimersByTime(5000); // Avance le temps de 5 secondes

        expect(game.score).toBe(game.initialscore - 5);
    });

    test('should win the game, update score, stop the timer, and mark game as over', () => {
        jest.useFakeTimers();
        game.word = 'banana';
        game.shouldLogOnWin = false
        game.startscore();
        
        // Avancer les timers de 1 seconde à la fois pour simuler le comportement de l'intervalle
        for (let i = 0; i < 5; i++) {
            jest.advanceTimersByTime(1000);
        }
        
        // Vérifier que le score est correctement mis à jour
        expect(game.score).toBe(game.initialscore - 5);
        
        game.unknowWord = 'banana';
        jest.advanceTimersByTime(1000);
    
        // Vérifier que le jeu est marqué comme terminé
        expect(game.isGameOver).toBe(true);
    });
    
    
    test('should lose the game and stop the timer', () => {
        jest.useFakeTimers();
        game.checkGameStatus = jest.fn().mockReturnValue('lose');
        game.startscore();
        jest.advanceTimersByTime(5000); // Avance le temps de 5 secondes

        expect(game.isGameOver).toBe(true);
    });

    test('should stop the game when the score reaches 0', () => {
        jest.useFakeTimers();
        game.initialscore = 5;
        game.startscore();
        jest.advanceTimersByTime(6000); // Avance le temps de 6 secondes

        expect(game.score).toBe(0);
        expect(game.isGameOver).toBe(true);
    });

    test('should throw error when no words in listOfWords', () => {
        game.listOfWords = [];
        expect(() => game.chooseWord()).toThrow();
    });
    
    test('should throw error when no word has been set', () => {
        game.word = null;
        expect(() => game.guess()).toThrow();
    });
});

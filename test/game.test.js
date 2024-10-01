const Game = require('../game.js');

let game;

beforeAll(async () => {
    game = new Game();
    await game.loadWords();
});

describe("Game test", () => {

    beforeEach(() => {
        game.reset(); // Reset the game state before each test
    });

    test("The word must be chosen correctly", () => {
        game.chooseWord();
        expect(game.word).toBeTruthy();  // Check if a word is chosen
    });

    test("should be 5 tries at the beginning of the game", () => {
        expect(game.getNumberOfTries()).toBe(5);
    });

    test("test the try mechanic with a correct guess", () => {
        game.word = "damien";
        game.unknowWord = "######";
        game.guess("a");
        expect(game.getNumberOfTries()).toBe(5);
        expect(game.print()).toBe("#a####");  // Check if the guessed letter is revealed
    });

    test("test the try mechanic with an incorrect guess", () => {
        game.word = "damien";
        game.unknowWord = "#a####";
        game.guess("x");
        expect(game.getNumberOfTries()).toBe(4);
        expect(game.print()).toBe("#a####");  // No letters should be revealed
    });

    test("should throw an error if no words are available", () => {
        game.listOfWords = [];
        expect(() => game.chooseWord()).toThrow("No words available to choose from.");
    });

    test("Same word for all on the same day", () => {
        game.chooseWord(); // Ensure chooseWord() is called after loading words
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const dateHash = parseInt(today, 10);
        const expectedIndex = dateHash % game.listOfWords.length;
        const expectedWord = game.listOfWords[expectedIndex];

        expect(game.word).toBe(expectedWord);
        expect(game.unknowWord).toBe(expectedWord.replace(/./g, '#'));
    });

    test("should not allow guessing after game over", () => {
        game.word = "damien";
        game.numberOfTry = 0; // Simulate game over
        expect(() => game.guess("a")).toThrow("Le mot n'a pas été défini.");
    });

    test("should correctly end game on win", () => {
        game.word = "damien";
        game.unknowWord = "######";
        game.guess("d");
        game.guess("a");
        game.guess("m");
        game.guess("i");
        game.guess("e");
        game.guess("n");
        expect(game.checkGameStatus()).toBe('win');
    });

    test("should correctly end game on lose", () => {
        game.word = "damien";
        game.unknowWord = "######";
        game.guess("x"); // First incorrect guess
        game.guess("y"); // Second incorrect guess
        expect(game.checkGameStatus()).toBe('continue'); // Before game over
        game.guess("z"); // Continue incorrect guesses
        expect(game.checkGameStatus()).toBe('lose');
    });

    test("should return the letters tried", () => {
        game.guess("d");
        game.guess("a");
        expect(game.getLettersTried()).toBe("d, a");
    });

    test("should have a reset method that resets game state", () => {
        game.word = "damien";
        game.guess("d");
        game.reset();
        expect(game.getNumberOfTries()).toBe(5);
        expect(game.word).toBeTruthy();
        expect(game.unknowWord).toBe(game.word.replace(/./g, '#'));
    });

    test("should throw an error when guessing without a word set", () => {
        game.word = null;
        expect(() => game.guess("a")).toThrow("Le mot n'a pas été défini.");
    });

    test("should not start scoring if the game is over", () => {
        game.word = "damien";
        game.numberOfTry = 0; // Simulate game over
        game.startscore(); // Start scoring
        expect(game.getscore()).toBe(0); // Score should be 0
    });

    test("should correctly manage the score", (done) => {
        game.startscore();
        setTimeout(() => {
            expect(game.getscore()).toBeLessThan(game.initialscore);
            done(); // Call done to indicate that the test is complete
        }, 2000); // Wait for some time to see if score decreases
    });
});

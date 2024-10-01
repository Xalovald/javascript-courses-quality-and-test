const Game = require('../game.js');
const fs = require('fs');

// Mocking the fs module for file system operations
jest.mock('fs');

// Mocking database.js module
jest.mock('./database.js', () => ({
  savePlayerData: jest.fn(),
  getPlayerData: jest.fn(),
  updatescore: jest.fn(),
}));

// Mocking tools.js with specific functions
jest.mock('../tools.js', () => ({
  replaceAt: (str, index, chr) => str.substr(0, index) + chr + str.substr(index + 1),
}));

describe('Game class', () => {
  let game;

  beforeEach(() => {
    game = new Game();
    jest.useFakeTimers('modern'); // Ensure modern fake timers
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('loadWords should load words from file', async () => {
    const mockWords = 'word\ntest\nexample\n';
    fs.createReadStream.mockReturnValue({
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(mockWords); // Pass the data directly as a string
        }
        if (event === 'end') {
          callback(); // Call the 'end' event
        }
        return this; // Ensure fluent API for chaining
      }),
    });

    await game.loadWords();
    expect(game.listOfWords).toEqual(['word', 'test', 'example']);
  });

  test('checkGameStatus should return correct status', () => {
    game.word = 'test';
    game.unknowWord = 'test';
    expect(game.checkGameStatus()).toBe('win');

    game.unknowWord = 't###';
    game.numberOfTry = 0;
    expect(game.checkGameStatus()).toBe('lose');

    game.numberOfTry = 1;
    expect(game.checkGameStatus()).toBe('continue');
  });

  test('chooseWord should select a word based on date', () => {
    game.listOfWords = ['word', 'test', 'example'];
    const mockDate = new Date('2023-01-01');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    game.chooseWord();
    expect(game.word).toBe('test'); // This is deterministic based on the date
    expect(game.unknowWord).toBe('####');
  });

  test('guess should update unknowWord and numberOfTry correctly', () => {
    game.word = 'test';
    game.unknowWord = '####';
    game.guess('t');
    expect(game.unknowWord).toBe('t##t');
    expect(game.numberOfTry).toBe(5);

    game.guess('x');
    expect(game.unknowWord).toBe('t##t');
    expect(game.numberOfTry).toBe(4);
  });

  test('getLettersTried should return correct letters', () => {
    game.word = 'test';
    game.guess('t');
    game.guess('e');
    game.guess('x');
    expect(game.getLettersTried()).toBe('t, e, x');
  });

  test('reset should reset game state', () => {
    game.word = 'test';
    game.unknowWord = 't##t';
    game.numberOfTry = 2;
    game.reset();
    expect(game.numberOfTry).toBe(5);
    expect(game.word).not.toBe('test');
    expect(game.unknowWord).toBe(game.word.replace(/./g, '#'));
  });

  test('startscore should update score over time', () => {
    game.startscore();
    jest.advanceTimersByTime(10000);
    expect(game.score).toBe(990);
  });

  test('startscore should stop when game is won', () => {
    game.word = 'test';
    game.unknowWord = 'test';
    game.startscore();
    jest.advanceTimersByTime(1000);
    expect(game.score).toBe(999);
    expect(game.isGameOver).toBe(true);
  });

  test('startscore should stop when game is lost', () => {
    game.word = 'test';
    game.numberOfTry = 0;
    game.startscore();
    jest.advanceTimersByTime(1000);
    expect(game.score).toBe(999);
    expect(game.isGameOver).toBe(true);
  });
});

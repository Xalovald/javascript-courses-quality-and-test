const tools = require('../tools.js');

describe('Tools Module', () => {
    test('should replace character at specified index', () => {
        const str = 'hello';
        const result = tools.replaceAt(str, 1, 'a'); // Change replaceCharAt to replaceAt
        expect(result).toBe('hallo');
    });

    test('should return a random integer less than the specified max', () => {
        const max = 10;
        const randomNumber = tools.getRandomInt(max);
        expect(randomNumber).toBeLessThan(max);
        expect(randomNumber).toBeGreaterThanOrEqual(0);
    });
});

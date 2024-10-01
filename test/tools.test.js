const { replaceAt } = require('../tools.js');

describe('tools functions', () => {
  test('replaceAt should replace character at given index', () => {
    expect(replaceAt('hello', 1, 'a')).toBe('hallo');
    expect(replaceAt('world', 0, 'W')).toBe('World');
    expect(replaceAt('test', 4, '!')).toBe('test');
    expect(replaceAt('', 0, 'a')).toBe('');
  });
});
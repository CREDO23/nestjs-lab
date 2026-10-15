import { fibonacci } from './fibonacci.worker';

describe('fibonacci worker', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 1],
    [10, 55],
    [20, 6765],
  ])('fibonacci(%i) returns %i', (n, expected) => {
    expect(fibonacci(n)).toBe(expected);
  });
});

import { fibonacci } from './fibonacci.worker';

// fibonacci.worker.ts assigns module.exports, so require() returns the
// function piscina calls in the worker thread.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const runTask = require('./fibonacci.worker') as (n: number) => number;

describe('fibonacci worker', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 1],
    [10, 55],
    [20, 6765],
  ])('returns fibonacci(%i) = %i', (n, expected) => {
    expect(runTask(n)).toBe(expected);
  });

  // `module.exports = ...` replaces the exports object that held the named
  // `fibonacci` export, so importing it gives undefined.
  it.failing('exposes fibonacci() as a named export', () => {
    expect(fibonacci(10)).toBe(55);
  });
});

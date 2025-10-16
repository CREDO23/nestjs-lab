import { parentPort } from 'worker_threads';

export function fibonacci(n: number): number {
  if (n < 2) {
    return n;
  }

  return fibonacci(n - 1) + fibonacci(n - 2);
}

parentPort?.on('message', ({ n, id }: { n: number; id: number }) => {
  const result = fibonacci(n);
  parentPort?.postMessage({ id, result });
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isGameResult } from '../src/results/result-data.ts';

const SETUP: Readonly<{ theme: string; player: string; boardSize: string }> = {
  theme: 'code_vibes', player: 'blue', boardSize: '4x4',
};

test('accepts a draw with both final scores', (): void => {
  assert.equal(isGameResult({ setup: SETUP, scores: { blue: 4, orange: 4 }, winner: null }), true);
});

test('accepts the player with the higher score as winner', (): void => {
  assert.equal(isGameResult({ setup: SETUP, scores: { blue: 5, orange: 3 }, winner: 'blue' }), true);
});

test('rejects an inconsistent winner or invalid scores', (): void => {
  assert.equal(isGameResult({ setup: SETUP, scores: { blue: 5, orange: 3 }, winner: 'orange' }), false);
  assert.equal(isGameResult({ setup: SETUP, scores: { blue: -1, orange: 4 }, winner: 'orange' }), false);
  assert.equal(isGameResult({ setup: SETUP, scores: { blue: 2.5, orange: 4 }, winner: 'orange' }), false);
});

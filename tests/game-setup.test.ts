import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isGameSetup } from '../src/game-setup.ts';

test('accepts one complete supported game setup', (): void => {
  assert.equal(isGameSetup({ theme: 'da_projects', player: 'orange', boardSize: '4x6' }), true);
});

test('rejects missing or unsupported setup values', (): void => {
  assert.equal(isGameSetup({ theme: 'code_vibes', player: 'blue' }), false);
  assert.equal(isGameSetup({ theme: 'unknown', player: 'blue', boardSize: '4x4' }), false);
  assert.equal(isGameSetup({ theme: 'code_vibes', player: 'green', boardSize: '6x6' }), false);
  assert.equal(isGameSetup(null), false);
});

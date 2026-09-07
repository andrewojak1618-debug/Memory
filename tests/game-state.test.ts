import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addPoint,
  createGameState,
  getWinner,
  hasTie,
  switchPlayer,
} from '../src/game-state.ts';
import type { GameState } from '../src/game-state.ts';

test('starts with the selected player and a tied zero score', (): void => {
  const state: GameState = createGameState('orange');
  assert.equal(state.currentPlayer, 'orange');
  assert.deepEqual(state.scores, { blue: 0, orange: 0 });
  assert.equal(hasTie(state), true);
});

test('awards one point and keeps the active player after a pair', (): void => {
  const state: GameState = createGameState('blue');
  assert.equal(addPoint(state), 1);
  assert.equal(state.currentPlayer, 'blue');
  assert.equal(getWinner(state), 'blue');
});

test('switches to the opposing player after a failed pair', (): void => {
  const state: GameState = createGameState('blue');
  assert.equal(switchPlayer(state), 'orange');
  assert.equal(switchPlayer(state), 'blue');
});

test('returns no winner when both scores are equal', (): void => {
  const state: GameState = createGameState('blue');
  addPoint(state);
  switchPlayer(state);
  addPoint(state);
  assert.equal(getWinner(state), null);
});

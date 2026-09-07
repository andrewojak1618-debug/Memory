import type { PlayerColor } from './theme-data';

export interface GameState {
  currentPlayer: PlayerColor;
  scores: Record<PlayerColor, number>;
}

export const POINTS_PER_PAIR: number = 1;

/** Creates a fresh score and turn state for the selected starting player. */
export function createGameState(startingPlayer: PlayerColor): GameState {
  return {
    currentPlayer: startingPlayer,
    scores: { blue: 0, orange: 0 },
  };
}

/** Awards one pair to the active player and returns the updated score. */
export function addPoint(state: GameState): number {
  state.scores[state.currentPlayer] += POINTS_PER_PAIR;
  return state.scores[state.currentPlayer];
}

/** Ends the current turn and returns the opposing player. */
export function switchPlayer(state: GameState): PlayerColor {
  state.currentPlayer = state.currentPlayer === 'blue' ? 'orange' : 'blue';
  return state.currentPlayer;
}

/** Reports whether both players currently have the same score. */
export function hasTie(state: GameState): boolean {
  return state.scores.blue === state.scores.orange;
}

/** Returns the leading player or no player when the score is tied. */
export function getWinner(state: GameState): PlayerColor | null {
  if (hasTie(state)) return null;
  return state.scores.blue > state.scores.orange ? 'blue' : 'orange';
}

import type { PlayerColor } from '../shared/theme-data';

export interface GameState {
  currentPlayer: PlayerColor;
  scores: Record<PlayerColor, number>;
}

export const POINTS_PER_PAIR: number = 1;

/**
 * Creates a fresh score and turn state for the selected starting player.
 * @param startingPlayer - The player who selected the setup and starts the round.
 * @returns A new state with zero points for both players.
 */
export function createGameState(startingPlayer: PlayerColor): GameState {
  return {
    currentPlayer: startingPlayer,
    scores: { blue: 0, orange: 0 },
  };
}

/**
 * Awards one pair to the active player and returns the updated score.
 * @param state - The active round state to update.
 * @returns The active player's updated score.
 */
export function addPoint(state: GameState): number {
  state.scores[state.currentPlayer] += POINTS_PER_PAIR;
  return state.scores[state.currentPlayer];
}

/**
 * Ends the current turn and returns the opposing player.
 * @param state - The active round state to update.
 * @returns The color of the newly active player.
 */
export function switchPlayer(state: GameState): PlayerColor {
  state.currentPlayer = state.currentPlayer === 'blue' ? 'orange' : 'blue';
  return state.currentPlayer;
}

/**
 * Reports whether both players currently have the same score.
 * @param state - The round state whose scores are compared.
 * @returns Whether both player scores are equal.
 */
export function hasTie(state: GameState): boolean {
  return state.scores.blue === state.scores.orange;
}

/**
 * Returns the leading player or no player when the score is tied.
 * @param state - The round state whose winner is determined.
 * @returns The leading player's color, or `null` for a tie.
 */
export function getWinner(state: GameState): PlayerColor | null {
  if (hasTie(state)) return null;
  return state.scores.blue > state.scores.orange ? 'blue' : 'orange';
}

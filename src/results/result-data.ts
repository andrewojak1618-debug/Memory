import { isGameSetup } from '../game/game-setup.ts';
import type { GameSetup } from '../game/game-setup';
import { isPlayerColor } from '../shared/player-color.ts';
import type { PlayerColor } from '../shared/theme-data';

export interface GameResult {
  readonly setup: GameSetup;
  readonly scores: Readonly<Record<PlayerColor, number>>;
  readonly winner: PlayerColor | null;
}

const GAME_RESULT_KEY: string = 'memory_game_result';
const MINIMUM_SCORE: number = 0;

/** Saves the final score for the short result-page sequence.
 * @param result - The completed round to present.
 */
export function saveGameResult(result: GameResult): void {
  sessionStorage.setItem(GAME_RESULT_KEY, JSON.stringify(result));
}

/**
 * Returns only a validated result saved by this browser tab.
 * @returns The stored game result, or `null` when missing or invalid.
 */
export function loadGameResult(): GameResult | null {
  const stored: string | null = sessionStorage.getItem(GAME_RESULT_KEY);
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    return isGameResult(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Clears completed scores before a new game or clean setup. */
export function clearGameResult(): void {
  sessionStorage.removeItem(GAME_RESULT_KEY);
}

/** Rejects incomplete scores and inconsistent winners.
 * @param value - Parsed storage content whose shape is not trusted.
 * @returns Whether the value is a consistent completed game result.
 */
export function isGameResult(value: unknown): value is GameResult {
  if (typeof value !== 'object' || value === null) return false;
  if (!('setup' in value) || !('scores' in value) || !('winner' in value)) return false;
  if (!isGameSetup(value.setup) || !isScores(value.scores)) return false;
  if (value.winner !== null && (
    typeof value.winner !== 'string' || !isPlayerColor(value.winner)
  )) return false;
  return value.winner === getScoreWinner(value.scores);
}

/** Validates the two nonnegative whole-number scores.
 * @param value - The unchecked score pair from storage.
 * @returns Whether both player scores are valid.
 */
function isScores(value: unknown): value is Readonly<Record<PlayerColor, number>> {
  if (typeof value !== 'object' || value === null) return false;
  if (!('blue' in value) || !('orange' in value)) return false;
  return isScore(value.blue) && isScore(value.orange);
}

/** Rejects fractional, negative, and nonnumeric scores.
 * @param value - One unchecked player score.
 * @returns Whether the value is a nonnegative whole-number score.
 */
function isScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= MINIMUM_SCORE;
}

/** Derives the winner solely from the final numbers.
 * @param scores - The validated scores for both players.
 * @returns The leading player color, or `null` for a tie.
 */
function getScoreWinner(scores: Readonly<Record<PlayerColor, number>>): PlayerColor | null {
  if (scores.blue === scores.orange) return null;
  return scores.blue > scores.orange ? 'blue' : 'orange';
}

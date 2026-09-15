import { isBoardSize } from './card-data.ts';
import type { BoardSize } from './card-data';
import { isGameTheme } from './theme-options.ts';
import type { GameTheme, PlayerColor } from './theme-data';

export interface GameSetup {
  readonly theme: GameTheme;
  readonly player: PlayerColor;
  readonly boardSize: BoardSize;
}

const GAME_SETUP_KEY: string = 'memory_game_setup';

/** Saves the selected settings only for this browser tab.
 * @param setup - The validated selection to use for the next game.
 */
export function saveGameSetup(setup: GameSetup): void {
  sessionStorage.setItem(GAME_SETUP_KEY, JSON.stringify(setup));
}

/** Validates stored settings before the game page uses them. */
export function loadGameSetup(): GameSetup | null {
  const stored: string | null = sessionStorage.getItem(GAME_SETUP_KEY);
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    return isGameSetup(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Removes settings after leaving the game. */
export function clearGameSetup(): void {
  sessionStorage.removeItem(GAME_SETUP_KEY);
}

/** Rejects missing and unsupported values from storage.
 * @param value - Parsed storage content whose shape is not trusted.
 */
export function isGameSetup(value: unknown): value is GameSetup {
  if (typeof value !== 'object' || value === null) return false;
  if (!('theme' in value) || !('player' in value) || !('boardSize' in value)) return false;
  return typeof value.theme === 'string' && isGameTheme(value.theme)
    && (value.player === 'blue' || value.player === 'orange')
    && typeof value.boardSize === 'string' && isBoardSize(value.boardSize);
}

import { DEFAULT_BOARD_SIZE } from './card-data';
import type { GameResult } from './result-data';
import type { GameTheme, PlayerColor } from './theme-data';

export type DebugResultView = 'game_over' | 'draw' | 'winner';

interface DebugResultChoice {
  readonly view: DebugResultView;
  readonly theme: GameTheme;
  readonly winner: PlayerColor | null;
}

const DEBUG_CHOICES: Readonly<Record<string, DebugResultChoice>> = {
  code_vibes_draw: { view: 'draw', theme: 'code_vibes', winner: null },
  da_projects_draw: { view: 'draw', theme: 'da_projects', winner: null },
  code_vibes_game_over: { view: 'game_over', theme: 'code_vibes', winner: 'orange' },
  da_projects_game_over: { view: 'game_over', theme: 'da_projects', winner: 'orange' },
  code_vibes_blue_winner: { view: 'winner', theme: 'code_vibes', winner: 'blue' },
  code_vibes_orange_winner: { view: 'winner', theme: 'code_vibes', winner: 'orange' },
  da_projects_blue_winner: { view: 'winner', theme: 'da_projects', winner: 'blue' },
  da_projects_orange_winner: { view: 'winner', theme: 'da_projects', winner: 'orange' },
};
const WINNING_DEBUG_SCORE: number = 5;
const LOSING_DEBUG_SCORE: number = 3;
const DRAW_DEBUG_SCORE: number = 4;

/** Supplies typed previews without entering fake scores into normal play.
 * @param view - The result page that requested a development preview.
 */
export function getDevelopmentResult(view: DebugResultView): GameResult | null {
  if (!import.meta.env.DEV) return null;
  const query: URLSearchParams = new URLSearchParams(window.location.search);
  const value: string | null = query.get('debug');
  const choice: DebugResultChoice | undefined = value ? DEBUG_CHOICES[value] : undefined;
  if (!choice || choice.view !== view) return null;
  return {
    setup: { theme: choice.theme, player: 'blue', boardSize: DEFAULT_BOARD_SIZE },
    scores: getDebugScores(choice.winner),
    winner: choice.winner,
  };
}

/** Keeps sample scores consistent with the requested outcome.
 * @param winner - The previewed winning color, or no color for a draw.
 */
function getDebugScores(winner: PlayerColor | null): Readonly<Record<PlayerColor, number>> {
  if (!winner) return { blue: DRAW_DEBUG_SCORE, orange: DRAW_DEBUG_SCORE };
  if (winner === 'blue') return { blue: WINNING_DEBUG_SCORE, orange: LOSING_DEBUG_SCORE };
  return { blue: LOSING_DEBUG_SCORE, orange: WINNING_DEBUG_SCORE };
}

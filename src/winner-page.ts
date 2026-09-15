import './styles/winner-page.scss';
import { clearGameSetup } from './game-setup';
import { getDevelopmentResult } from './result-debug';
import { clearGameResult, loadGameResult } from './result-data';
import type { GameResult } from './result-data';
import type { GameTheme, PlayerColor } from './theme-data';
import { initWinnerConfetti } from './winner-confetti';

const WINNER_VIEW: HTMLElement | null = document.getElementById('winner_view');
const WINNER_CONTENT: HTMLElement | null = document.getElementById('winner_content');
const WINNER_TITLE: HTMLElement | null = document.getElementById('winner_title');
const WINNER_PAWN: HTMLElement | null = document.getElementById('winner_pawn');
const BACK_BUTTON: HTMLElement | null = document.querySelector('.game_result__winner_back_button');
const WINNER_IMAGES: Readonly<Record<GameTheme, Record<PlayerColor, string>>> = {
  code_vibes: {
    blue: './assets/images/chess_pawn_blue.png',
    orange: './assets/images/chess_pawn_orange.png',
  },
  da_projects: {
    blue: './assets/images/chess_pawn_white_blue.png',
    orange: './assets/images/chess_pawn_white_orange.png',
  },
};
let isNavigating: boolean = false;

/** Presents only the winner belonging to the completed round. */
function init(): void {
  const result: GameResult | null = getDevelopmentResult('winner') ?? loadGameResult();
  if (!result?.winner) {
    window.location.replace('./settings.html');
    return;
  }
  applyWinnerTheme(result);
  applyWinnerContent(result);
  BACK_BUTTON?.addEventListener('click', returnToSettings);
  if (result.setup.theme === 'code_vibes') initWinnerConfetti();
  WINNER_VIEW?.focus();
}

/** Applies the winner page's selected background.
 * @param result - The completed round to show.
 */
function applyWinnerTheme(result: GameResult): void {
  WINNER_VIEW?.classList.add(`game_result_${result.setup.theme}`);
  const label: HTMLElement | null = BACK_BUTTON?.querySelector('.game_result__back_label') ?? null;
  if (label) label.textContent = result.setup.theme === 'da_projects' ? 'Home' : 'Back to start';
}

/** Writes the winner's label, dimensions, and pawn image.
 * @param result - The completed round with one winning color.
 */
function applyWinnerContent(result: GameResult): void {
  const winner: PlayerColor | null = result.winner;
  if (!winner) return;
  WINNER_CONTENT?.classList.remove(
    'game_result__winner_content_blue', 'game_result__winner_content_orange',
  );
  WINNER_CONTENT?.classList.add(`game_result__winner_content_${winner}`);
  if (WINNER_TITLE) WINNER_TITLE.textContent = getWinnerLabel(result.setup.theme, winner);
  if (WINNER_PAWN instanceof HTMLImageElement) WINNER_PAWN.src = WINNER_IMAGES[result.setup.theme][winner];
}

/** Uses the capitalization specified by each visual theme.
 * @param theme - The completed round's selected theme.
 * @param winner - The player with the higher final score.
 */
function getWinnerLabel(theme: GameTheme, winner: PlayerColor): string {
  const color: string = winner === 'blue' ? 'Blue' : 'Orange';
  return theme === 'da_projects' ? `${color} Player` : `${color.toUpperCase()} PLAYER`;
}

/** Clears the completed game before returning to empty Settings. */
function returnToSettings(): void {
  if (isNavigating) return;
  isNavigating = true;
  clearGameResult();
  clearGameSetup();
  window.location.assign('./settings.html');
}

init();

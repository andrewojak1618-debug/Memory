import './styles/style.scss';
import { initGameBoard, renderGameBoard, resetGameBoard } from './game-board';
import { clearGameSetup, loadGameSetup } from './game-setup';
import type { GameSetup } from './game-setup';
import { applyGameTheme } from './game-theme';
import { prepareGamePlayers, resetGamePlayers } from './player-settings';
import { initQuitDialog } from './quit-dialog';
import { clearGameResult, loadGameResult } from './result-data';
import type { GameResult } from './result-data';

const CODE_VIBES_DRAW_DEBUG_VALUE: string = 'code_vibes_draw';
const DA_PROJECTS_DRAW_DEBUG_VALUE: string = 'da_projects_draw';
let isLeaving: boolean = false;

/** Initializes only the separate game page. */
function init(): void {
  if (redirectDevelopmentDraw()) return;
  if (redirectCompletedResult()) return;
  const setup: GameSetup | null = loadGameSetup();
  if (!setup) {
    window.location.replace('./settings.html');
    return;
  }
  initGameBoard();
  window.addEventListener('pagehide', resetGameBoard);
  initQuitDialog(leaveGame);
  prepareGameView(setup);
}

/**
 * Prevents browser history from silently resetting a completed round.
 * @returns Whether navigation to a stored result page was started.
 */
function redirectCompletedResult(): boolean {
  const result: GameResult | null = loadGameResult();
  if (!result) return false;
  window.location.replace(result.winner ? './winner.html' : './draw.html');
  return true;
}

/** Sets the selected theme, starting player, and shuffled board.
 * @param setup - The validated choices transferred from Settings.
 */
function prepareGameView(setup: GameSetup): void {
  applyGameTheme(setup.theme);
  prepareGamePlayers(setup.theme, setup.player);
  renderGameBoard(setup.theme, setup.boardSize);
}

/** Clears the abandoned setup before returning to clean settings. */
function leaveGame(): void {
  if (isLeaving) return;
  isLeaving = true;
  clearGameSetup();
  clearGameResult();
  resetGameBoard();
  resetGamePlayers();
  window.location.assign('./settings.html');
}

/**
 * Keeps existing draw debug links usable without loading result markup here.
 * @returns Whether navigation to a draw preview was started.
 */
function redirectDevelopmentDraw(): boolean {
  if (!import.meta.env.DEV) return false;
  const query: URLSearchParams = new URLSearchParams(window.location.search);
  const value: string | null = query.get('debug');
  if (value !== CODE_VIBES_DRAW_DEBUG_VALUE && value !== DA_PROJECTS_DRAW_DEBUG_VALUE) {
    return false;
  }
  window.location.replace(`./draw.html?debug=${value}`);
  return true;
}

init();

import './styles/draw-page.scss';
import { clearGameSetup, saveGameSetup } from './game-setup';
import { getDevelopmentResult } from './result-debug';
import { clearGameResult, loadGameResult } from './result-data';
import type { GameResult } from './result-data';
import type { GameTheme } from './theme-data';

const DRAW_VIEW: HTMLElement | null = document.getElementById('tie_result_view');
const DRAW_ACTIONS: HTMLElement | null = document.querySelector('.game_result__actions');
const HOME_BUTTON: HTMLElement | null = document.getElementById('back_to_start_button');
const REVANCHE_BUTTON: HTMLElement | null = document.getElementById('new_game_button');
const SCALE_ICON: HTMLElement | null = document.getElementById('tie_scale_icon');
const SCALE_IMAGES: Readonly<Record<GameTheme, string>> = {
  code_vibes: './assets/images/scale_icon.png',
  da_projects: './assets/images/draw_da_icon.png',
};
let activeResult: GameResult | null = null;
let isNavigating: boolean = false;

/** Presents one draw without loading winner or game-over markup. */
function init(): void {
  activeResult = getDevelopmentResult('draw') ?? loadGameResult();
  if (!activeResult || activeResult.winner !== null) {
    window.location.replace('./settings.html');
    return;
  }
  applyDrawTheme(activeResult.setup.theme);
  HOME_BUTTON?.addEventListener('click', handleHomeClick);
  REVANCHE_BUTTON?.addEventListener('click', startRevanche);
  document.getElementById('tie_result_title')?.focus();
}

/** Applies the draw image and return label belonging to one theme.
 * @param theme - The completed round's chosen theme.
 */
function applyDrawTheme(theme: GameTheme): void {
  DRAW_VIEW?.classList.add(`game_result_${theme}`);
  if (SCALE_ICON instanceof HTMLImageElement) SCALE_ICON.src = SCALE_IMAGES[theme];
  const label: HTMLElement | null = HOME_BUTTON?.querySelector('.game_result__back_label') ?? null;
  if (label) label.textContent = theme === 'da_projects' ? 'Home' : 'Back to start';
}

/** Reveals Revanche on first touch or returns to clean Settings.
 * @param event - The pointer-backed button click.
 */
function handleHomeClick(event: MouseEvent): void {
  if (revealRevancheOnTouch(event)) return;
  returnToSettings();
}

/** Keeps both choices reachable without hover on touch screens.
 * @param event - The pointer-backed button click.
 */
function revealRevancheOnTouch(event: MouseEvent): boolean {
  if (!('pointerType' in event) || event.pointerType !== 'touch') return false;
  if (DRAW_ACTIONS?.classList.contains('is_touch_open')) return false;
  DRAW_ACTIONS?.classList.add('is_touch_open');
  return true;
}

/** Starts a fresh shuffled round with the same two player colors. */
function startRevanche(): void {
  if (!activeResult || isNavigating) return;
  isNavigating = true;
  clearGameResult();
  saveGameSetup(activeResult.setup);
  window.location.assign('./game.html');
}

/** Clears the previous round before opening the settings form. */
function returnToSettings(): void {
  if (isNavigating) return;
  isNavigating = true;
  clearGameResult();
  clearGameSetup();
  window.location.assign('./settings.html');
}

init();

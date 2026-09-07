import { THEME_CONFIGS } from './theme-data';
import type { GameTheme, GameThemeConfig, PlayerColor } from './theme-data';

const ICON_DIRECTORY: string = './assets/icons';
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const GAME_CONTAINER: HTMLElement | null = document.getElementById('game_container');
const GAME_TITLE: HTMLElement | null = document.getElementById('game_title');
const EXIT_ICON: HTMLElement | null = document.getElementById('game_exit_icon');

/** Applies text, assets and modifier classes for one selected theme. */
export function applyGameTheme(theme: GameTheme): void {
  const config: GameThemeConfig = THEME_CONFIGS[theme];
  if (GAME_CONTAINER) GAME_CONTAINER.className = `game__container game__container_${theme}`;
  GAME_VIEW?.classList.toggle('game_da_projects', theme === 'da_projects');
  updateGameText(config.label);
  updateImage(EXIT_ICON, config.exitIconFileName, '');
  updateScoreIcons(config);
}

/** Returns the icon file for the selected player and theme. */
export function getCurrentPlayerIcon(theme: GameTheme, color: PlayerColor): string {
  return THEME_CONFIGS[theme].currentPlayerIcons[color];
}

/** Sets the accessible name for the active game. */
function updateGameText(themeLabel: string): void {
  const gameName: string = `${themeLabel} memory game`;
  if (GAME_TITLE) GAME_TITLE.textContent = gameName;
  GAME_VIEW?.setAttribute('aria-label', gameName);
}

/** Applies both theme-specific score symbols. */
function updateScoreIcons(config: GameThemeConfig): void {
  updateImage(document.getElementById('blue_score_icon'), config.scoreIcons.blue, '');
  updateImage(document.getElementById('orange_score_icon'), config.scoreIcons.orange, '');
}

/** Updates one image without duplicating path handling. */
function updateImage(element: HTMLElement | null, fileName: string, alt: string): void {
  if (!(element instanceof HTMLImageElement)) return;
  element.src = `${ICON_DIRECTORY}/${fileName}`;
  element.alt = alt;
}

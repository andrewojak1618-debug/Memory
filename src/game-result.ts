import type { GameTheme, PlayerColor } from './theme-data';
import {
  getColorLabel,
  getOpponentColor,
  getPlayerScore,
  getSelectedPlayerColor,
} from './player-settings';

interface GameOverPlayerPresentation {
  itemClass: string;
  iconFileName: string;
}

interface GameOverPlayerElements {
  item: HTMLElement | null;
  icon: HTMLElement | null;
  label: HTMLElement | null;
  score: HTMLElement | null;
}

interface WinnerPresentation {
  contentClass: string;
  label: string;
}

const HOME_VIEW: HTMLElement | null = document.getElementById('home_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const GAME_OVER_VIEW: HTMLElement | null = document.getElementById('game_over_view');
const GAME_OVER_TITLE: HTMLElement | null = document.getElementById('game_over_title');
const GAME_OVER_DA_PROJECTS_TITLE: HTMLElement | null = document.getElementById(
  'game_over_da_projects_title',
);
const GAME_OVER_PLAYER_ONE: GameOverPlayerElements = {
  item: document.getElementById('game_over_player_one'),
  icon: document.getElementById('game_over_player_one_icon'),
  label: document.getElementById('game_over_player_one_label'),
  score: document.getElementById('game_over_player_one_score'),
};
const GAME_OVER_PLAYER_TWO: GameOverPlayerElements = {
  item: document.getElementById('game_over_player_two'),
  icon: document.getElementById('game_over_player_two_icon'),
  label: document.getElementById('game_over_player_two_label'),
  score: document.getElementById('game_over_player_two_score'),
};
const TIE_RESULT_VIEW: HTMLElement | null = document.getElementById('tie_result_view');
const WINNER_VIEW: HTMLElement | null = document.getElementById('winner_view');
const WINNER_CONTENT: HTMLElement | null = document.getElementById('winner_content');
const WINNER_TITLE: HTMLElement | null = document.getElementById('winner_title');
const WINNER_PAWN: HTMLElement | null = document.getElementById('winner_pawn');
const TIE_RESULT_TITLE: HTMLElement | null = document.getElementById('tie_result_title');
const TIE_SCALE_ICON: HTMLImageElement | null = document.querySelector<HTMLImageElement>(
  '#tie_scale_icon',
);
const RESULT_THEME_CLASSES: readonly string[] = [
  'game_result_code_vibes',
  'game_result_da_projects',
];
const GAME_OVER_PLAYER_CLASSES: readonly string[] = ['is_blue', 'is_orange'];
const GAME_OVER_PLAYER_PRESENTATIONS: Readonly<Record<PlayerColor, GameOverPlayerPresentation>> = {
  blue: { itemClass: 'is_blue', iconFileName: 'blue_player_arrow.svg' },
  orange: { itemClass: 'is_orange', iconFileName: 'orange_player_arrow.svg' },
};
const BACK_TO_START_BUTTONS: NodeListOf<HTMLButtonElement> = document.querySelectorAll(
  '.game_result__back_button',
);
const DRAW_ACTIONS: HTMLElement | null = document.querySelector('.game_result__actions');
const DRAW_BACK_BUTTON: HTMLElement | null = document.getElementById('back_to_start_button');
const WINNER_IMAGE_DIRECTORY: string = './assets/images';
const TIE_SCALE_IMAGES: Readonly<Record<GameTheme, string>> = {
  code_vibes: `${WINNER_IMAGE_DIRECTORY}/scale_icon.png`,
  da_projects: `${WINNER_IMAGE_DIRECTORY}/draw_da_icon.png`,
};
const WINNER_IMAGES: Readonly<Record<GameTheme, Record<PlayerColor, string>>> = {
  code_vibes: {
    blue: `${WINNER_IMAGE_DIRECTORY}/chess_pawn_blue.png`,
    orange: `${WINNER_IMAGE_DIRECTORY}/chess_pawn_orange.png`,
  },
  da_projects: {
    blue: `${WINNER_IMAGE_DIRECTORY}/chess_pawn_white_blue.png`,
    orange: `${WINNER_IMAGE_DIRECTORY}/chess_pawn_white_orange.png`,
  },
};
const WINNER_PRESENTATIONS: Record<PlayerColor, WinnerPresentation> = {
  blue: {
    contentClass: 'game_result__winner_content_blue',
    label: 'BLUE PLAYER',
  },
  orange: {
    contentClass: 'game_result__winner_content_orange',
    label: 'ORANGE PLAYER',
  },
};
const DA_PROJECTS_WINNER_LABELS: Readonly<Record<PlayerColor, string>> = {
  blue: 'Blue Player',
  orange: 'Orange Player',
};
const WINNER_TRANSITION_DELAY_MS: number = 8000;
let activeResultTheme: GameTheme = 'code_vibes';
let pendingWinner: PlayerColor | null = null;
let winnerTransitionTimer: number | null = null;

/** Connects the result action with the clean home-view reset. */
export function initGameResult(resetGame: () => void): void {
  DRAW_BACK_BUTTON?.addEventListener('click', revealDrawActionsOnTouch);
  BACK_TO_START_BUTTONS.forEach((button: HTMLButtonElement): void => {
    button.addEventListener('click', (): void => showSettingsView(resetGame));
  });
}

/** Reveals both draw actions before a touch can leave the result view. */
function revealDrawActionsOnTouch(event: MouseEvent): void {
  if (!('pointerType' in event) || event.pointerType !== 'touch') return;
  if (DRAW_ACTIONS?.classList.contains('is_touch_open')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  DRAW_ACTIONS?.classList.add('is_touch_open');
}

/** Applies the selected theme to both reusable result views. */
export function setGameResultTheme(theme: GameTheme): void {
  activeResultTheme = theme;
  setResultViewTheme(GAME_OVER_VIEW, theme);
  updateGameOverLabel(theme);
  setResultViewTheme(TIE_RESULT_VIEW, theme);
  updateTieScaleIcon(theme);
  setResultViewTheme(WINNER_VIEW, theme);
  updateResultBackLabels(theme);
}

/** Selects the scale illustration belonging to the active theme. */
function updateTieScaleIcon(theme: GameTheme): void {
  if (!TIE_SCALE_ICON) return;
  TIE_SCALE_ICON.src = TIE_SCALE_IMAGES[theme];
}

/** Associates the Game-over view with its currently visible theme heading. */
function updateGameOverLabel(theme: GameTheme): void {
  const titleId: string = theme === 'da_projects'
    ? 'game_over_da_projects_title' : 'game_over_title';
  GAME_OVER_VIEW?.setAttribute('aria-labelledby', titleId);
}

/** Updates the reusable result actions for the selected theme. */
function updateResultBackLabels(theme: GameTheme): void {
  const label: string = theme === 'da_projects' ? 'Home' : 'Back to start';
  BACK_TO_START_BUTTONS.forEach((button: HTMLButtonElement): void => {
    const content: HTMLElement | null = button.querySelector('.game_result__back_label');
    if (content) content.textContent = label;
  });
}

/** Replaces the theme modifier on one result view. */
function setResultViewTheme(view: HTMLElement | null, theme: GameTheme): void {
  if (!view) return;
  view.classList.remove(...RESULT_THEME_CLASSES);
  view.classList.add(`game_result_${theme}`);
}

/** Replaces the completed game with the draw result view. */
export function showTieResult(): void {
  if (!GAME_VIEW || !TIE_RESULT_VIEW) return;
  if (SETTINGS_VIEW) SETTINGS_VIEW.hidden = true;
  GAME_VIEW.hidden = true;
  if (GAME_OVER_VIEW) GAME_OVER_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  DRAW_ACTIONS?.classList.remove('is_touch_open');
  TIE_RESULT_VIEW.hidden = false;
  TIE_RESULT_TITLE?.focus();
}

/** Opens the empty Game-over view without starting its winner timer. */
export function showGameOverView(): void {
  if (!GAME_OVER_VIEW) return;
  updateGameOverPlayers();
  if (SETTINGS_VIEW) SETTINGS_VIEW.hidden = true;
  if (GAME_VIEW) GAME_VIEW.hidden = true;
  if (TIE_RESULT_VIEW) TIE_RESULT_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  GAME_OVER_VIEW.hidden = false;
  focusGameOverTitle();
}

/** Moves focus to the heading belonging to the active Game-over theme. */
function focusGameOverTitle(): void {
  const title: HTMLElement | null = activeResultTheme === 'da_projects'
    ? GAME_OVER_DA_PROJECTS_TITLE : GAME_OVER_TITLE;
  title?.focus();
}

/** Shows both players in their selected order in the final-score panel. */
function updateGameOverPlayers(): void {
  const playerOne: PlayerColor = getSelectedPlayerColor() ?? 'blue';
  updateGameOverPlayer(GAME_OVER_PLAYER_ONE, playerOne, 'Player 1');
  updateGameOverPlayer(GAME_OVER_PLAYER_TWO, getOpponentColor(playerOne), 'Player 2');
  updateDaProjectsScores();
}

/** Updates both fixed-color score groups in the DA Projects result panel. */
function updateDaProjectsScores(): void {
  updateDaProjectsScore('blue');
  updateDaProjectsScore('orange');
}

/** Writes one current score into its DA Projects player group. */
function updateDaProjectsScore(color: PlayerColor): void {
  const item: HTMLElement | null = document.getElementById(`game_over_da_projects_${color}_score_item`);
  const scoreElement: HTMLElement | null = document.getElementById(`game_over_da_projects_${color}_score`);
  const score: number = getPlayerScore(color);
  if (scoreElement) scoreElement.textContent = String(score);
  item?.setAttribute('aria-label', `${getColorLabel(color)} player score: ${score}`);
}

/** Applies one player's color, symbol and score to its final-score entry. */
function updateGameOverPlayer(elements: GameOverPlayerElements, player: PlayerColor, playerName: string): void {
  const presentation: GameOverPlayerPresentation = GAME_OVER_PLAYER_PRESENTATIONS[player];
  const score: number = getPlayerScore(player);
  const label: string = getColorLabel(player);
  updateGameOverPlayerItem(elements.item, presentation, `${playerName}: ${label}, score: ${score}`);
  updateGameOverPlayerContent(elements, label, score);
  updateGameOverPlayerIcon(elements.icon, presentation.iconFileName);
}

/** Applies identifying classes and an accessible summary to one score entry. */
function updateGameOverPlayerItem(
  item: HTMLElement | null,
  presentation: GameOverPlayerPresentation,
  accessibleLabel: string,
): void {
  item?.classList.remove(...GAME_OVER_PLAYER_CLASSES);
  item?.classList.add(presentation.itemClass);
  item?.setAttribute('aria-label', accessibleLabel);
}

/** Writes one player's visible label and score. */
function updateGameOverPlayerContent(
  elements: GameOverPlayerElements,
  label: string,
  score: number,
): void {
  if (elements.label) elements.label.textContent = label;
  if (elements.score) elements.score.textContent = String(score);
}

/** Selects the arrow icon belonging to one player. */
function updateGameOverPlayerIcon(icon: HTMLElement | null, fileName: string): void {
  if (!(icon instanceof HTMLImageElement)) return;
  icon.src = `./assets/icons/${fileName}`;
}

/** Shows the short Game-over transition before revealing the winner. */
export function showWinnerTransition(winner: PlayerColor): void {
  if (!GAME_OVER_VIEW) return;
  showGameOverView();
  scheduleWinnerResult(winner);
}

/** Restarts the single winner transition timer for the completed game. */
function scheduleWinnerResult(winner: PlayerColor): void {
  if (winnerTransitionTimer !== null) window.clearTimeout(winnerTransitionTimer);
  pendingWinner = winner;
  winnerTransitionTimer = window.setTimeout(finishWinnerTransition, WINNER_TRANSITION_DELAY_MS);
}

/** Replaces the Game-over transition with the stored winner. */
function finishWinnerTransition(): void {
  const winner: PlayerColor | null = pendingWinner;
  pendingWinner = null;
  winnerTransitionTimer = null;
  if (winner) showWinnerResult(winner);
}

/** Replaces the completed game with the winning player's view. */
export function showWinnerResult(winner: PlayerColor): void {
  if (!GAME_VIEW || !WINNER_VIEW) return;
  if (HOME_VIEW) HOME_VIEW.hidden = true;
  if (SETTINGS_VIEW) SETTINGS_VIEW.hidden = true;
  GAME_VIEW.hidden = true;
  if (GAME_OVER_VIEW) GAME_OVER_VIEW.hidden = true;
  if (TIE_RESULT_VIEW) TIE_RESULT_VIEW.hidden = true;
  applyWinnerPresentation(winner);
  WINNER_VIEW.hidden = false;
  WINNER_VIEW.focus();
}

/** Applies the content and dimensions belonging to one winner. */
function applyWinnerPresentation(winner: PlayerColor): void {
  const presentation: WinnerPresentation = WINNER_PRESENTATIONS[winner];
  const label: string = getWinnerLabel(winner, presentation.label);
  WINNER_CONTENT?.classList.remove(
    'game_result__winner_content_blue', 'game_result__winner_content_orange',
  );
  WINNER_CONTENT?.classList.add(presentation.contentClass);
  if (WINNER_TITLE) WINNER_TITLE.textContent = label;
  if (WINNER_PAWN instanceof HTMLImageElement) {
    WINNER_PAWN.src = WINNER_IMAGES[activeResultTheme][winner];
  }
}

/** Returns the capitalization belonging to the active result theme. */
function getWinnerLabel(winner: PlayerColor, codeVibesLabel: string): string {
  return activeResultTheme === 'da_projects'
    ? DA_PROJECTS_WINNER_LABELS[winner] : codeVibesLabel;
}

/** Resets the completed round and opens a clean settings view. */
function showSettingsView(resetGame: () => void): void {
  if (!SETTINGS_VIEW) return;
  resetGame();
  if (GAME_OVER_VIEW) GAME_OVER_VIEW.hidden = true;
  if (TIE_RESULT_VIEW) TIE_RESULT_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  SETTINGS_VIEW.hidden = false;
  document.getElementById('settings_title')?.focus();
}

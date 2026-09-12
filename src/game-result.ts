import type { GameTheme, PlayerColor } from './theme-data';

interface WinnerPresentation {
  contentClass: string;
  label: string;
}

const HOME_VIEW: HTMLElement | null = document.getElementById('home_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const GAME_OVER_VIEW: HTMLElement | null = document.getElementById('game_over_view');
const GAME_OVER_TITLE: HTMLElement | null = document.getElementById('game_over_title');
const TIE_RESULT_VIEW: HTMLElement | null = document.getElementById('tie_result_view');
const WINNER_VIEW: HTMLElement | null = document.getElementById('winner_view');
const WINNER_CONTENT: HTMLElement | null = document.getElementById('winner_content');
const WINNER_TITLE: HTMLElement | null = document.getElementById('winner_title');
const WINNER_PAWN: HTMLElement | null = document.getElementById('winner_pawn');
const WINNER_BACK_LABEL: HTMLElement | null = WINNER_VIEW
  ?.querySelector<HTMLElement>('.game_result__back_label') ?? null;
const TIE_RESULT_TITLE: HTMLElement | null = document.getElementById('tie_result_title');
const HOME_TITLE: HTMLElement | null = document.getElementById('home_title');
const RESULT_THEME_CLASSES: readonly string[] = [
  'game_result_code_vibes',
  'game_result_da_projects',
];
const BACK_TO_START_BUTTONS: NodeListOf<HTMLButtonElement> = document.querySelectorAll(
  '.game_result__back_button',
);
const WINNER_IMAGE_DIRECTORY: string = './assets/images';
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
const WINNER_TRANSITION_DELAY_MS: number = 4000;
let activeResultTheme: GameTheme = 'code_vibes';
let pendingWinner: PlayerColor | null = null;
let winnerTransitionTimer: number | null = null;

/** Connects the result action with the home view. */
export function initGameResult(): void {
  BACK_TO_START_BUTTONS.forEach((button: HTMLButtonElement): void => {
    button.addEventListener('click', showHomeView);
  });
}

/** Applies the selected theme to both reusable result views. */
export function setGameResultTheme(theme: GameTheme): void {
  activeResultTheme = theme;
  setResultViewTheme(GAME_OVER_VIEW, theme);
  setResultViewTheme(TIE_RESULT_VIEW, theme);
  setResultViewTheme(WINNER_VIEW, theme);
  updateWinnerBackLabel(theme);
}

/** Updates the reusable winner action for the selected theme. */
function updateWinnerBackLabel(theme: GameTheme): void {
  if (!WINNER_BACK_LABEL) return;
  WINNER_BACK_LABEL.textContent = theme === 'da_projects' ? 'Home' : 'Back to start';
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
  if (HOME_VIEW) HOME_VIEW.hidden = true;
  if (SETTINGS_VIEW) SETTINGS_VIEW.hidden = true;
  GAME_VIEW.hidden = true;
  if (GAME_OVER_VIEW) GAME_OVER_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  TIE_RESULT_VIEW.hidden = false;
  TIE_RESULT_TITLE?.focus();
}

/** Opens the empty Game-over view without starting its winner timer. */
export function showGameOverView(): void {
  if (!GAME_OVER_VIEW) return;
  if (HOME_VIEW) HOME_VIEW.hidden = true;
  if (SETTINGS_VIEW) SETTINGS_VIEW.hidden = true;
  if (GAME_VIEW) GAME_VIEW.hidden = true;
  if (TIE_RESULT_VIEW) TIE_RESULT_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  GAME_OVER_VIEW.hidden = false;
  GAME_OVER_TITLE?.focus();
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

/** Returns from the completed game to the start view. */
function showHomeView(): void {
  if (!HOME_VIEW) return;
  if (GAME_OVER_VIEW) GAME_OVER_VIEW.hidden = true;
  if (TIE_RESULT_VIEW) TIE_RESULT_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  HOME_VIEW.hidden = false;
  HOME_TITLE?.focus();
}

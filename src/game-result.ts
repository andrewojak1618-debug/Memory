import type { PlayerColor } from './theme-data';

interface WinnerPresentation {
  contentClass: string;
  imagePath: string;
  label: string;
}

const HOME_VIEW: HTMLElement | null = document.getElementById('home_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const TIE_RESULT_VIEW: HTMLElement | null = document.getElementById('tie_result_view');
const WINNER_VIEW: HTMLElement | null = document.getElementById('winner_view');
const WINNER_CONTENT: HTMLElement | null = document.getElementById('winner_content');
const WINNER_TITLE: HTMLElement | null = document.getElementById('winner_title');
const WINNER_PAWN: HTMLElement | null = document.getElementById('winner_pawn');
const TIE_RESULT_TITLE: HTMLElement | null = document.getElementById('tie_result_title');
const HOME_TITLE: HTMLElement | null = document.getElementById('home_title');
const BACK_TO_START_BUTTONS: NodeListOf<HTMLButtonElement> = document.querySelectorAll(
  '.game_result__back_button',
);
const WINNER_IMAGE_DIRECTORY: string = './assets/images';
const WINNER_PRESENTATIONS: Record<PlayerColor, WinnerPresentation> = {
  blue: {
    contentClass: 'game_result__winner_content_blue',
    imagePath: `${WINNER_IMAGE_DIRECTORY}/chess_pawn_blue.png`,
    label: 'BLUE PLAYER',
  },
  orange: {
    contentClass: 'game_result__winner_content_orange',
    imagePath: `${WINNER_IMAGE_DIRECTORY}/chess_pawn_orange.png`,
    label: 'ORANGE PLAYER',
  },
};

/** Connects the result action with the home view. */
export function initGameResult(): void {
  BACK_TO_START_BUTTONS.forEach((button: HTMLButtonElement): void => {
    button.addEventListener('click', showHomeView);
  });
}

/** Replaces the completed game with the draw result view. */
export function showTieResult(): void {
  if (!GAME_VIEW || !TIE_RESULT_VIEW) return;
  if (HOME_VIEW) HOME_VIEW.hidden = true;
  if (SETTINGS_VIEW) SETTINGS_VIEW.hidden = true;
  GAME_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  TIE_RESULT_VIEW.hidden = false;
  TIE_RESULT_TITLE?.focus();
}

/** Replaces the completed game with the winning player's view. */
export function showWinnerResult(winner: PlayerColor): void {
  if (!GAME_VIEW || !WINNER_VIEW) return;
  if (HOME_VIEW) HOME_VIEW.hidden = true;
  if (SETTINGS_VIEW) SETTINGS_VIEW.hidden = true;
  GAME_VIEW.hidden = true;
  if (TIE_RESULT_VIEW) TIE_RESULT_VIEW.hidden = true;
  applyWinnerPresentation(winner);
  WINNER_VIEW.hidden = false;
  WINNER_VIEW.focus();
}

/** Applies the content and dimensions belonging to one winner. */
function applyWinnerPresentation(winner: PlayerColor): void {
  const presentation: WinnerPresentation = WINNER_PRESENTATIONS[winner];
  WINNER_CONTENT?.classList.remove(
    'game_result__winner_content_blue', 'game_result__winner_content_orange',
  );
  WINNER_CONTENT?.classList.add(presentation.contentClass);
  if (WINNER_TITLE) WINNER_TITLE.textContent = presentation.label;
  if (WINNER_PAWN instanceof HTMLImageElement) WINNER_PAWN.src = presentation.imagePath;
}

/** Returns from the completed game to the start view. */
function showHomeView(): void {
  if (!HOME_VIEW) return;
  if (TIE_RESULT_VIEW) TIE_RESULT_VIEW.hidden = true;
  if (WINNER_VIEW) WINNER_VIEW.hidden = true;
  HOME_VIEW.hidden = false;
  HOME_TITLE?.focus();
}

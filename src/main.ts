import './styles/style.scss';
import { initGameBoard, renderGameBoard } from './game-board';
import {
  initGameResult,
  setGameResultTheme,
  showTieResult,
  showWinnerResult,
} from './game-result';
import { applyGameTheme } from './game-theme';
import { prepareGamePlayers, updatePlayerAssignment } from './player-settings';
import { initQuitDialog } from './quit-dialog';
import { isGameTheme } from './theme-data';
import type { GameTheme } from './theme-data';
import { initWinnerConfetti } from './winner-confetti';

const HOME_VIEW: HTMLElement | null = document.getElementById('home_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const SETTINGS_TITLE: HTMLElement | null = document.getElementById('settings_title');
const PLAY_BUTTON: HTMLElement | null = document.getElementById('play_button');
const SETTINGS_FORM: HTMLElement | null = document.getElementById('settings_form');
const START_BUTTON: HTMLElement | null = document.getElementById('start_button');
const CODE_VIBES_PREVIEW: HTMLElement | null = document.getElementById('code_vibes_preview');
const DA_PROJECTS_PREVIEW: HTMLElement | null = document.getElementById('da_projects_preview');
const DEBUG_PARAMETER: string = 'debug';
const TIE_RESULT_DEBUG_VALUE: string = 'tie_result';
const BLUE_WINNER_DEBUG_VALUE: string = 'blue_winner';
const ORANGE_WINNER_DEBUG_VALUE: string = 'orange_winner';
const DA_PROJECTS_WINNER_DEBUG_VALUE: string = 'da_projects_winner';

/** Connects the available controls with their actions. */
function init(): void {
  initGameBoard();
  initGameResult();
  initQuitDialog();
  initWinnerConfetti();
  if (showDebugView()) return;
  PLAY_BUTTON?.addEventListener('click', showSettings);
  START_BUTTON?.addEventListener('click', showGame);
  SETTINGS_FORM?.addEventListener('change', updateSettingsState);
  updateSettingsState();
}

/** Opens a requested development view without changing normal navigation. */
function showDebugView(): boolean {
  const parameters: URLSearchParams = new URLSearchParams(window.location.search);
  const debugView: string | null = parameters.get(DEBUG_PARAMETER);
  if (debugView === TIE_RESULT_DEBUG_VALUE) showTieResult();
  else if (debugView === BLUE_WINNER_DEBUG_VALUE) showWinnerResult('blue');
  else if (debugView === ORANGE_WINNER_DEBUG_VALUE) showWinnerResult('orange');
  else if (debugView === DA_PROJECTS_WINNER_DEBUG_VALUE) showDaProjectsWinnerDebug();
  else return false;
  return true;
}

/** Opens the reusable winner view with the DA Projects presentation. */
function showDaProjectsWinnerDebug(): void {
  setGameResultTheme('da_projects');
  showWinnerResult('blue');
}

/** Opens the settings view and places focus on its heading. */
function showSettings(): void {
  if (!HOME_VIEW || !SETTINGS_VIEW) return;

  HOME_VIEW.hidden = true;
  SETTINGS_VIEW.hidden = false;
  SETTINGS_TITLE?.focus();
}

/** Opens the game only after all required settings are selected. */
function showGame(): void {
  const hasAllSettings: boolean = isSettingSelected('theme')
    && isSettingSelected('player') && isSettingSelected('board_size');
  if (!hasAllSettings || !SETTINGS_VIEW || !GAME_VIEW) return;

  prepareGameView();
  SETTINGS_VIEW.hidden = true;
  GAME_VIEW.hidden = false;
  GAME_VIEW.focus();
}

/** Prepares only the game view belonging to the selected theme. */
function prepareGameView(): void {
  const theme: GameTheme | null = getSelectedTheme();
  if (!theme) return;
  applyGameTheme(theme);
  setGameResultTheme(theme);
  prepareGamePlayers(theme);
  renderGameBoard(theme);
}

/** Updates the setup progress and availability of the start button. */
function updateSettingsState(): void {
  const hasTheme: boolean = setStepState('theme_step', 'theme');
  const hasPlayer: boolean = setStepState('player_step', 'player');
  const hasBoard: boolean = setStepState('board_step', 'board_size');

  updateThemePreview();
  updatePlayerAssignment();
  if (START_BUTTON instanceof HTMLButtonElement) {
    const isEnabled: boolean = hasTheme && hasPlayer && hasBoard;
    START_BUTTON.disabled = !isEnabled;
  }
}

/** Displays the preview that belongs to the selected theme. */
function updateThemePreview(): void {
  const showDaProjects: boolean = getSelectedTheme() === 'da_projects';
  if (CODE_VIBES_PREVIEW) CODE_VIBES_PREVIEW.hidden = showDaProjects;
  if (DA_PROJECTS_PREVIEW) DA_PROJECTS_PREVIEW.hidden = !showDaProjects;
}

/** Reads and validates the selected game theme. */
function getSelectedTheme(): GameTheme | null {
  const selectedTheme: Element | null = document.querySelector('input[name="theme"]:checked');
  if (!(selectedTheme instanceof HTMLInputElement)) return null;
  return isGameTheme(selectedTheme.value) ? selectedTheme.value : null;
}

/** Marks one setup step when its radio group has a selection. */
function setStepState(stepId: string, inputName: string): boolean {
  const step: HTMLElement | null = document.getElementById(stepId);
  const isSelected: boolean = isSettingSelected(inputName);

  if (isSelected) step?.classList.add('is_complete');
  else step?.classList.remove('is_complete');
  return isSelected;
}

/** Checks whether one settings radio group has a selected option. */
function isSettingSelected(inputName: string): boolean {
  const selector: string = `input[name="${inputName}"]:checked`;
  return document.querySelector(selector) !== null;
}

init();

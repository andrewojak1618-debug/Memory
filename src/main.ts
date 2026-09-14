import { CARD_COUNTS, isBoardSize } from './card-data';
import type { BoardSize } from './card-data';
import { initGameBoard, renderGameBoard, resetGameBoard } from './game-board';
import {
  initGameResult,
  setGameResultTheme,
  showTieResult,
} from './game-result';
import { applyGameTheme } from './game-theme';
import {
  getColorLabel,
  getSelectedPlayerColor,
  prepareGamePlayers,
  resetGamePlayers,
  updatePlayerAssignment,
} from './player-settings';
import { initQuitDialog } from './quit-dialog';
import { isGameTheme, THEME_CONFIGS } from './theme-data';
import type { GameTheme, PlayerColor } from './theme-data';
import { initWinnerConfetti } from './winner-confetti';

const HOME_VIEW: HTMLElement | null = document.getElementById('home_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const SETTINGS_TITLE: HTMLElement | null = document.getElementById('settings_title');
const PLAY_BUTTON: HTMLElement | null = document.getElementById('play_button');
const SETTINGS_FORM: HTMLElement | null = document.getElementById('settings_form');
const SETTINGS_FOOTER: HTMLElement | null = document.querySelector('.settings__footer');
const SETTINGS_VALIDATION_MESSAGE: HTMLElement | null = document.getElementById(
  'settings_validation_message',
);
const TIE_RESULT_VIEW: HTMLElement | null = document.getElementById('tie_result_view');
const NEW_GAME_BUTTON: HTMLElement | null = document.getElementById('new_game_button');
const START_BUTTON: HTMLElement | null = document.getElementById('start_button');
const CODE_VIBES_PREVIEW: HTMLElement | null = document.getElementById('code_vibes_preview');
const DA_PROJECTS_PREVIEW: HTMLElement | null = document.getElementById('da_projects_preview');
const FOOTER_SELECTION_CLASSES: readonly string[] = [
  'selection_count_0', 'selection_count_1', 'selection_count_2', 'selection_count_3',
];
const CODE_VIBES_DRAW_DEBUG_VALUE: string = 'code_vibes_draw';
const DA_PROJECTS_DRAW_DEBUG_VALUE: string = 'da_projects_draw';
interface SettingRequirement {
  readonly name: string;
  readonly label: string;
}
const REQUIRED_SETTINGS: readonly SettingRequirement[] = [
  { name: 'theme', label: 'Theme' },
  { name: 'player', label: 'Player' },
  { name: 'board_size', label: 'Board size' },
];

/** Connects the available controls with their actions. */
function init(): void {
  initGameBoard();
  initGameResult(resetGameSetup);
  initQuitDialog(resetGameSetup);
  initWinnerConfetti();
  PLAY_BUTTON?.addEventListener('click', showSettings);
  START_BUTTON?.addEventListener('click', showGame);
  NEW_GAME_BUTTON?.addEventListener('click', startNewRound);
  SETTINGS_FORM?.addEventListener('change', updateSettingsState);
  updateSettingsState();
  openDevelopmentView();
}

/** Opens the DA Projects draw screen only while Vite runs in development mode. */
function openDevelopmentView(): void {
  if (!import.meta.env.DEV) return;
  const query: URLSearchParams = new URLSearchParams(window.location.search);
  const debugValue: string | null = query.get('debug');
  if (!isDrawDebugValue(debugValue)) return;
  const theme: GameTheme = debugValue === CODE_VIBES_DRAW_DEBUG_VALUE
    ? 'code_vibes' : 'da_projects';
  selectDebugSetting('theme', theme);
  selectDebugSetting('player', 'blue');
  selectDebugSetting('board_size', '4x4');
  updateSettingsState();
  setGameResultTheme(theme);
  showTieResult();
}

/** Checks whether the query requests one supported draw preview. */
function isDrawDebugValue(value: string | null): boolean {
  return value === CODE_VIBES_DRAW_DEBUG_VALUE || value === DA_PROJECTS_DRAW_DEBUG_VALUE;
}

/** Selects one safe development value for testing the new-round action. */
function selectDebugSetting(name: string, value: string): void {
  const selector: string = `input[name="${name}"][value="${value}"]`;
  const input: HTMLInputElement | null = document.querySelector<HTMLInputElement>(selector);
  if (input) input.checked = true;
}

/** Opens the settings view and places focus on its heading. */
function showSettings(): void {
  if (!HOME_VIEW || !SETTINGS_VIEW) return;

  HOME_VIEW.hidden = true;
  SETTINGS_VIEW.hidden = false;
  SETTINGS_TITLE?.focus();
}

/** Restores a clean setup after leaving or completing a game. */
function resetGameSetup(): void {
  if (SETTINGS_FORM instanceof HTMLFormElement) SETTINGS_FORM.reset();
  resetGameBoard();
  resetGamePlayers();
  updateSettingsState();
  hideValidationMessage();
}

/** Opens the game only after all required settings are selected. */
function showGame(): void {
  const missingSettings: string[] = getMissingSettings();
  if (showMissingSettings(missingSettings)) return;
  openGameView();
}

/** Starts a shuffled round with the settings from the completed game. */
function startNewRound(): void {
  if (!getSelectedTheme() || !GAME_VIEW || !TIE_RESULT_VIEW) return;
  prepareGameView();
  TIE_RESULT_VIEW.hidden = true;
  GAME_VIEW.hidden = false;
  GAME_VIEW.focus();
}

/** Reports an incomplete setup and tells the caller to stop opening the game. */
function showMissingSettings(missingSettings: readonly string[]): boolean {
  if (missingSettings.length === 0) return false;
  showValidationMessage(missingSettings);
  return true;
}

/** Opens one prepared game and prevents a duplicate start. */
function openGameView(): void {
  if (!SETTINGS_VIEW || !GAME_VIEW || !GAME_VIEW.hidden) return;
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
  updateFooterState(hasTheme, hasPlayer, hasBoard);
  updateStartButtonState(hasTheme && hasPlayer && hasBoard);
}

/** Keeps the start control operable for accessible validation feedback. */
function updateStartButtonState(isEnabled: boolean): void {
  if (!(START_BUTTON instanceof HTMLButtonElement)) return;
  START_BUTTON.classList.toggle('is_unavailable', !isEnabled);
  START_BUTTON.setAttribute('aria-disabled', String(!isEnabled));
  if (isEnabled) hideValidationMessage();
  else if (!SETTINGS_VALIDATION_MESSAGE?.hidden) showValidationMessage(getMissingSettings());
}

/** Returns the visible names of every setup category that is still empty. */
function getMissingSettings(): string[] {
  return REQUIRED_SETTINGS
    .filter((setting: SettingRequirement): boolean => !isSettingSelected(setting.name))
    .map((setting: SettingRequirement): string => setting.label);
}

/** Announces and displays the incomplete setup without changing the layout. */
function showValidationMessage(missingSettings: readonly string[]): void {
  if (!SETTINGS_VALIDATION_MESSAGE) return;
  SETTINGS_VALIDATION_MESSAGE.textContent = `Please select: ${missingSettings.join(', ')}.`;
  SETTINGS_VALIDATION_MESSAGE.hidden = false;
}

/** Removes validation feedback after the setup becomes complete. */
function hideValidationMessage(): void {
  if (!SETTINGS_VALIDATION_MESSAGE) return;
  SETTINGS_VALIDATION_MESSAGE.hidden = true;
  SETTINGS_VALIDATION_MESSAGE.textContent = '';
}

/** Applies the compact presentation while every setup option is empty. */
function updateFooterState(hasTheme: boolean, hasPlayer: boolean, hasBoard: boolean): void {
  const selections: boolean[] = [hasTheme, hasPlayer, hasBoard];
  const selectionCount: number = selections.filter(
    (isSelected: boolean): boolean => isSelected,
  ).length;
  SETTINGS_FOOTER?.classList.remove(...FOOTER_SELECTION_CLASSES);
  SETTINGS_FOOTER?.classList.add(`selection_count_${selectionCount}`);
  SETTINGS_FOOTER?.classList.toggle('is_unselected', selectionCount === 0);
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

  if (step) step.textContent = getStepLabel(stepId);
  if (isSelected) step?.classList.add('is_complete');
  else step?.classList.remove('is_complete');
  return isSelected;
}

/** Returns the shorter initial label used before the theme is selected. */
function getStepLabel(stepId: string): string {
  const theme: GameTheme | null = getSelectedTheme();
  const player: PlayerColor | null = getSelectedPlayerColor();
  if (stepId === 'theme_step') return theme ? THEME_CONFIGS[theme].label : 'Theme';
  if (stepId === 'player_step') return player ? `${getColorLabel(player)} Player` : 'Player';
  return getSelectedBoardLabel();
}

/** Returns the selected number of cards for the setup summary. */
function getSelectedBoardLabel(): string {
  const selected: Element | null = document.querySelector('input[name="board_size"]:checked');
  if (!(selected instanceof HTMLInputElement) || !isBoardSize(selected.value)) return 'Board size';
  const boardSize: BoardSize = selected.value;
  return `Board - ${CARD_COUNTS[boardSize]} Cards`;
}

/** Checks whether one settings radio group has a selected option. */
function isSettingSelected(inputName: string): boolean {
  const selector: string = `input[name="${inputName}"]:checked`;
  return document.querySelector(selector) !== null;
}

init();

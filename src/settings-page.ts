import './styles/settings-page.scss';
import { CARD_COUNTS, isBoardSize } from './card-data';
import type { BoardSize } from './card-data';
import { saveGameSetup } from './game-setup';
import type { GameSetup } from './game-setup';
import { getColorLabel } from './player-color';
import { clearGameResult } from './result-data';
import { getSelectedPlayerColor, updatePlayerAssignment } from './settings-player';
import { isGameTheme, THEME_LABELS } from './theme-options';
import type { GameTheme, PlayerColor } from './theme-data';

const SETTINGS_FORM: HTMLElement | null = document.getElementById('settings_form');
const SETTINGS_FOOTER: HTMLElement | null = document.querySelector('.settings__footer');
const SETTINGS_VALIDATION_MESSAGE: HTMLElement | null = document.getElementById(
  'settings_validation_message',
);
const START_BUTTON: HTMLElement | null = document.getElementById('start_button');
const CODE_VIBES_PREVIEW: HTMLElement | null = document.getElementById('code_vibes_preview');
const DA_PROJECTS_PREVIEW: HTMLElement | null = document.getElementById('da_projects_preview');
const FOOTER_SELECTION_CLASSES: readonly string[] = [
  'selection_count_0', 'selection_count_1', 'selection_count_2', 'selection_count_3',
];
interface SettingRequirement {
  readonly name: string;
  readonly label: string;
}
const REQUIRED_SETTINGS: readonly SettingRequirement[] = [
  { name: 'theme', label: 'Theme' },
  { name: 'player', label: 'Player' },
  { name: 'board_size', label: 'Board size' },
];
let isNavigating: boolean = false;

/** Connects the setup form to its progress and start controls. */
function init(): void {
  START_BUTTON?.addEventListener('click', startSelectedGame);
  SETTINGS_FORM?.addEventListener('change', updateSettingsState);
  updateSettingsState();
}

/** Validates and transfers one complete setup to the separate game page. */
function startSelectedGame(): void {
  if (isNavigating) return;
  const missing: string[] = getMissingSettings();
  if (missing.length > 0) {
    showValidationMessage(missing);
    return;
  }
  const setup: GameSetup | null = getCompleteSetup();
  if (!setup) return;
  clearGameResult();
  saveGameSetup(setup);
  isNavigating = true;
  window.location.assign('./game.html');
}

/** Reads the complete, supported selection without retaining the form. */
function getCompleteSetup(): GameSetup | null {
  const theme: GameTheme | null = getSelectedTheme();
  const player: PlayerColor | null = getSelectedPlayerColor();
  const boardSize: BoardSize | null = getSelectedBoardSize();
  return theme && player && boardSize ? { theme, player, boardSize } : null;
}

/** Reads one supported board-size value from the setup form. */
function getSelectedBoardSize(): BoardSize | null {
  const selected: Element | null = document.querySelector('input[name="board_size"]:checked');
  if (!(selected instanceof HTMLInputElement)) return null;
  return isBoardSize(selected.value) ? selected.value : null;
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
  if (stepId === 'theme_step') return theme ? THEME_LABELS[theme] : 'Theme';
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

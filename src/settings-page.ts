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
const DEPENDENT_SETTING_GROUPS: NodeListOf<HTMLFieldSetElement> = document.querySelectorAll(
  '.setting_group_player, .setting_group_board',
);
const FOOTER_SELECTION_CLASSES: readonly string[] = [
  'selection_count_0', 'selection_count_1', 'selection_count_2', 'selection_count_3',
];
const MIN_VISIBLE_SELECTION_COUNT: number = 2;
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
  START_BUTTON?.addEventListener('pointerenter', updateStartHover);
  START_BUTTON?.addEventListener('pointerleave', updateStartHover);
  SETTINGS_FORM?.addEventListener('change', updateSettingsState);
  updateSettingsState();
}

/** Keeps the footer aligned with the enlarged, available start control.
 * @param event - The pointer entering or leaving the start control.
 */
function updateStartHover(event: PointerEvent): void {
  const isAvailable: boolean = START_BUTTON instanceof HTMLButtonElement &&
    !START_BUTTON.classList.contains('is_unavailable');
  SETTINGS_FOOTER?.classList.toggle(
    'is_start_hovered', isAvailable && event.type === 'pointerenter',
  );
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
  const showSelectedSteps: boolean = getSelectedSettingCount() >= MIN_VISIBLE_SELECTION_COUNT;
  const hasTheme: boolean = setStepState('theme_step', 'theme', showSelectedSteps);
  const hasPlayer: boolean = setStepState('player_step', 'player', showSelectedSteps);
  const hasBoard: boolean = setStepState('board_step', 'board_size', showSelectedSteps);

  updateDependentSettings(hasTheme);
  updateThemePreview();
  updatePlayerAssignment();
  updateFooterState();
  updateStartButtonState(hasTheme && hasPlayer && hasBoard);
}

/** Unlocks dependent settings after a game theme has been selected. */
function updateDependentSettings(hasTheme: boolean): void {
  DEPENDENT_SETTING_GROUPS.forEach((group: HTMLFieldSetElement): void => {
    group.disabled = !hasTheme;
  });
}

/** Keeps the start control operable for accessible validation feedback. */
function updateStartButtonState(isEnabled: boolean): void {
  if (!(START_BUTTON instanceof HTMLButtonElement)) return;
  START_BUTTON.classList.toggle('is_unavailable', !isEnabled);
  if (!isEnabled) SETTINGS_FOOTER?.classList.remove('is_start_hovered');
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

/** Keeps the footer compact until two setup categories are selected. */
function updateFooterState(): void {
  const selectionCount: number = getSelectedSettingCount();
  SETTINGS_FOOTER?.classList.remove(...FOOTER_SELECTION_CLASSES);
  SETTINGS_FOOTER?.classList.add(`selection_count_${selectionCount}`);
  SETTINGS_FOOTER?.classList.toggle('is_unselected', selectionCount < MIN_VISIBLE_SELECTION_COUNT);
}

/** Counts completed categories without changing their radio states. */
function getSelectedSettingCount(): number {
  return REQUIRED_SETTINGS.filter(
    (setting: SettingRequirement): boolean => isSettingSelected(setting.name),
  ).length;
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

/** Marks one setup step once the footer shows completed choices.
 * @param stepId - The footer step to update.
 * @param inputName - The related radio group.
 * @param showSelectedSteps - Whether completed categories are visible yet.
 */
function setStepState(stepId: string, inputName: string, showSelectedSteps: boolean): boolean {
  const step: HTMLElement | null = document.getElementById(stepId);
  const isSelected: boolean = isSettingSelected(inputName);

  if (step) step.textContent = showSelectedSteps ? getStepLabel(stepId) : getInitialStepLabel(stepId);
  if (isSelected && showSelectedSteps) step?.classList.add('is_complete');
  else step?.classList.remove('is_complete');
  return isSelected;
}

/** Returns the neutral footer label before progress is displayed.
 * @param stepId - The footer step whose label is requested.
 */
function getInitialStepLabel(stepId: string): string {
  if (stepId === 'theme_step') return 'Theme';
  if (stepId === 'player_step') return 'Player';
  return 'Board size';
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

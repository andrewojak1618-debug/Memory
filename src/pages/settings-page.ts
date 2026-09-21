import '../styles/entries/settings-page.scss';
import { CARD_COUNTS, isBoardSize } from '../game/card-data';
import type { BoardSize } from '../game/card-data';
import { saveGameSetup } from '../game/game-setup';
import type { GameSetup } from '../game/game-setup';
import { getColorLabel } from '../shared/player-color';
import { clearGameResult } from '../results/result-data';
import { getSelectedPlayerColor, updatePlayerAssignment } from '../settings/settings-player';
import { isGameTheme, THEME_LABELS } from '../settings/theme-options';
import type { GameTheme, PlayerColor } from '../shared/theme-data';

const SETTINGS_FORM: HTMLElement | null = document.getElementById('settings_form');
const SETTINGS_FOOTER: HTMLElement | null = document.querySelector('.settings__footer');
const SETTINGS_VALIDATION_MESSAGE: HTMLElement | null = document.getElementById(
  'settings_validation_message',
);
const START_BUTTON: HTMLElement | null = document.getElementById('start_button');
const CODE_VIBES_PREVIEW: HTMLElement | null = document.getElementById('code_vibes_preview');
const DA_PROJECTS_PREVIEW: HTMLElement | null = document.getElementById('da_projects_preview');
const THEME_OPTIONS: NodeListOf<HTMLLabelElement> = document.querySelectorAll(
  '.setting_group_theme .setting_option',
);
const FOOTER_SELECTION_CLASSES: readonly string[] = [
  'selection_count_0', 'selection_count_1', 'selection_count_2', 'selection_count_3',
];
const MIN_VISIBLE_SELECTION_COUNT: number = 3;
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
  THEME_OPTIONS.forEach(connectThemePreviewEvents);
  SETTINGS_FORM?.addEventListener('change', updateSettingsState);
  updateSettingsState();
}

/** Connects one theme option to temporary pointer and focus previews.
 * @param option - The label containing one theme radio input.
 */
function connectThemePreviewEvents(option: HTMLLabelElement): void {
  option.addEventListener('pointerenter', previewThemeFromEvent);
  option.addEventListener('pointerleave', restoreSelectedThemePreview);
  option.addEventListener('focusin', previewThemeFromEvent);
  option.addEventListener('focusout', restoreSelectedThemePreview);
}

/** Shows the theme represented by the currently explored option.
 * @param event - The pointer or focus event emitted by a theme label.
 */
function previewThemeFromEvent(event: Event): void {
  const theme: GameTheme | null = getThemeFromOption(event.currentTarget);
  if (theme) showThemePreview(theme);
}

/** Restores the selected preview after pointer and focus leave an option.
 * @param event - The pointer or focus event emitted by a theme label.
 */
function restoreSelectedThemePreview(event: Event): void {
  const option: EventTarget | null = event.currentTarget;
  if (!(option instanceof HTMLLabelElement)) return;
  if (option.matches(':hover') || option.contains(document.activeElement)) return;
  updateThemePreview();
}

/** Reads a supported theme value from one option label.
 * @param target - The event target expected to contain a theme input.
 * @returns The represented theme, or `null` for an invalid target.
 */
function getThemeFromOption(target: EventTarget | null): GameTheme | null {
  if (!(target instanceof HTMLLabelElement)) return null;
  const input: HTMLInputElement | null = target.querySelector('input[name="theme"]');
  return input && isGameTheme(input.value) ? input.value : null;
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

/**
 * Reads the complete, supported selection without retaining the form.
 * @returns The complete setup, or `null` while a category is missing.
 */
function getCompleteSetup(): GameSetup | null {
  const theme: GameTheme | null = getSelectedTheme();
  const player: PlayerColor | null = getSelectedPlayerColor();
  const boardSize: BoardSize | null = getSelectedBoardSize();
  return theme && player && boardSize ? { theme, player, boardSize } : null;
}

/**
 * Reads one supported board-size value from the setup form.
 * @returns The selected board size, or `null` before a valid selection.
 */
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

  updateThemePreview();
  updatePlayerAssignment();
  updateFooterState();
  updateStartButtonState(hasTheme && hasPlayer && hasBoard);
}

/**
 * Keeps the start control operable for accessible validation feedback.
 * @param isEnabled - Whether all required settings are selected.
 */
function updateStartButtonState(isEnabled: boolean): void {
  if (!(START_BUTTON instanceof HTMLButtonElement)) return;
  START_BUTTON.classList.toggle('is_unavailable', !isEnabled);
  if (!isEnabled) SETTINGS_FOOTER?.classList.remove('is_start_hovered');
  START_BUTTON.setAttribute('aria-disabled', String(!isEnabled));
  if (isEnabled) hideValidationMessage();
  else if (!SETTINGS_VALIDATION_MESSAGE?.hidden) showValidationMessage(getMissingSettings());
}

/**
 * Returns the visible names of every setup category that is still empty.
 * @returns The labels of all incomplete settings categories.
 */
function getMissingSettings(): string[] {
  return REQUIRED_SETTINGS
    .filter((setting: SettingRequirement): boolean => !isSettingSelected(setting.name))
    .map((setting: SettingRequirement): string => setting.label);
}

/**
 * Announces and displays the incomplete setup without changing the layout.
 * @param missingSettings - The visible labels of incomplete categories.
 */
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

/** Keeps the footer compact until all setup categories are selected. */
function updateFooterState(): void {
  const selectionCount: number = getSelectedSettingCount();
  SETTINGS_FOOTER?.classList.remove(...FOOTER_SELECTION_CLASSES);
  SETTINGS_FOOTER?.classList.add(`selection_count_${selectionCount}`);
  SETTINGS_FOOTER?.classList.toggle('is_unselected', selectionCount < MIN_VISIBLE_SELECTION_COUNT);
}

/**
 * Counts completed categories without changing their radio states.
 * @returns The number of selected settings categories.
 */
function getSelectedSettingCount(): number {
  return REQUIRED_SETTINGS.filter(
    (setting: SettingRequirement): boolean => isSettingSelected(setting.name),
  ).length;
}

/** Displays the preview that belongs to the selected theme. */
function updateThemePreview(): void {
  showThemePreview(getSelectedTheme() ?? 'code_vibes');
}

/** Displays one preview without changing the selected theme.
 * @param theme - The theme whose preview should be visible.
 */
function showThemePreview(theme: GameTheme): void {
  const showDaProjects: boolean = theme === 'da_projects';
  setPreviewVisibility(CODE_VIBES_PREVIEW, !showDaProjects);
  setPreviewVisibility(DA_PROJECTS_PREVIEW, showDaProjects);
}

/** Synchronizes visual and assistive visibility for one preview.
 * @param preview - The preview element to update.
 * @param isVisible - Whether the preview belongs to the active context.
 */
function setPreviewVisibility(preview: HTMLElement | null, isVisible: boolean): void {
  if (!preview) return;
  preview.hidden = !isVisible;
  preview.setAttribute('aria-hidden', String(!isVisible));
}

/**
 * Reads and validates the selected game theme.
 * @returns The selected theme, or `null` before a valid selection.
 */
function getSelectedTheme(): GameTheme | null {
  const selectedTheme: Element | null = document.querySelector('input[name="theme"]:checked');
  if (!(selectedTheme instanceof HTMLInputElement)) return null;
  return isGameTheme(selectedTheme.value) ? selectedTheme.value : null;
}

/** Marks one setup step once the footer shows completed choices.
 * @param stepId - The footer step to update.
 * @param inputName - The related radio group.
 * @param showSelectedSteps - Whether completed categories are visible yet.
 * @returns Whether this category currently has a selected option.
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
 * @returns The neutral label for the requested footer step.
 */
function getInitialStepLabel(stepId: string): string {
  if (stepId === 'theme_step') return 'Theme';
  if (stepId === 'player_step') return 'Player';
  return 'Board size';
}

/**
 * Returns the shorter initial label used before the theme is selected.
 * @param stepId - The footer step whose current label is requested.
 * @returns The selected value label or its neutral fallback.
 */
function getStepLabel(stepId: string): string {
  const theme: GameTheme | null = getSelectedTheme();
  const player: PlayerColor | null = getSelectedPlayerColor();
  if (stepId === 'theme_step') return theme ? THEME_LABELS[theme] : 'Theme';
  if (stepId === 'player_step') return player ? `${getColorLabel(player)} Player` : 'Player';
  return getSelectedBoardLabel();
}

/**
 * Returns the selected number of cards for the setup summary.
 * @returns The board summary or its neutral label before selection.
 */
function getSelectedBoardLabel(): string {
  const selected: Element | null = document.querySelector('input[name="board_size"]:checked');
  if (!(selected instanceof HTMLInputElement) || !isBoardSize(selected.value)) return 'Board size';
  const boardSize: BoardSize = selected.value;
  return `Board - ${CARD_COUNTS[boardSize]} Cards`;
}

/**
 * Checks whether one settings radio group has a selected option.
 * @param inputName - The radio-group name to inspect.
 * @returns Whether that group contains a checked option.
 */
function isSettingSelected(inputName: string): boolean {
  const selector: string = `input[name="${inputName}"]:checked`;
  return document.querySelector(selector) !== null;
}

init();

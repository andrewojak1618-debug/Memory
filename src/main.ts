import './styles/style.scss';
import { initGameBoard, renderGameBoard } from './game-board';
import { updatePlayerAssignment } from './player-settings';
import { initQuitDialog } from './quit-dialog';

const HOME_VIEW: HTMLElement | null = document.getElementById('home_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const SETTINGS_TITLE: HTMLElement | null = document.getElementById('settings_title');
const PLAY_BUTTON: HTMLElement | null = document.getElementById('play_button');
const SETTINGS_FORM: HTMLElement | null = document.getElementById('settings_form');
const START_BUTTON: HTMLElement | null = document.getElementById('start_button');
const CODE_VIBES_PREVIEW: HTMLElement | null = document.getElementById('code_vibes_preview');
const DA_PROJECTS_PREVIEW: HTMLElement | null = document.getElementById('da_projects_preview');

/** Connects the available controls with their actions. */
function init(): void {
  initGameBoard();
  initQuitDialog();
  renderGamePlayers();
  PLAY_BUTTON?.addEventListener('click', showSettings);
  START_BUTTON?.addEventListener('click', showGame);
  SETTINGS_FORM?.addEventListener('change', updateSettingsState);
  updateSettingsState();
}

/** Reuses only local preview markup; no user input is inserted as HTML. */
function renderGamePlayers(): void {
  const source: Element | null = document.querySelector('.theme_preview_header__left');
  const target: Element | null = document.querySelector('.game__code_vibes_header_left_content');
  if (!source || !target) return;

  target.innerHTML = source.innerHTML;
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

  if (isDaProjectsTheme()) GAME_VIEW.classList.add('game_da_projects');
  else GAME_VIEW.classList.remove('game_da_projects');
  renderGameBoard();
  SETTINGS_VIEW.hidden = true;
  GAME_VIEW.hidden = false;
  GAME_VIEW.focus();
}

/** Updates the setup progress and availability of the start button. */
function updateSettingsState(): void {
  const hasTheme: boolean = setStepState('theme_step', 'theme');
  const hasPlayer: boolean = setStepState('player_step', 'player');
  const hasBoard: boolean = setStepState('board_step', 'board_size');

  updateThemePreview();
  updatePlayerAssignment();
  if (START_BUTTON instanceof HTMLButtonElement) {
    START_BUTTON.disabled = !(hasTheme && hasPlayer && hasBoard);
  }
}

/** Displays the preview that belongs to the selected theme. */
function updateThemePreview(): void {
  const showDaProjects: boolean = isDaProjectsTheme();

  if (CODE_VIBES_PREVIEW) CODE_VIBES_PREVIEW.hidden = showDaProjects;
  if (DA_PROJECTS_PREVIEW) DA_PROJECTS_PREVIEW.hidden = !showDaProjects;
}

/** Identifies the selected theme for both preview and game appearance. */
function isDaProjectsTheme(): boolean {
  const selectedTheme: Element | null = document.querySelector('input[name="theme"]:checked');
  return selectedTheme instanceof HTMLInputElement && selectedTheme.value === 'da_projects';
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

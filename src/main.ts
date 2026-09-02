import './styles/style.scss';

const HOME_VIEW: HTMLElement | null = document.getElementById('home_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');
const SETTINGS_TITLE: HTMLElement | null = document.getElementById('settings_title');
const PLAY_BUTTON: HTMLElement | null = document.getElementById('play_button');
const SETTINGS_FORM: HTMLElement | null = document.getElementById('settings_form');
const START_BUTTON: HTMLElement | null = document.getElementById('start_button');

/** Connects the available controls with their actions. */
function init(): void {
  PLAY_BUTTON?.addEventListener('click', showSettings);
  SETTINGS_FORM?.addEventListener('change', updateSettingsState);
  updateSettingsState();
}

/** Opens the settings view and places focus on its heading. */
function showSettings(): void {
  if (!HOME_VIEW || !SETTINGS_VIEW) return;

  HOME_VIEW.hidden = true;
  SETTINGS_VIEW.hidden = false;
  SETTINGS_TITLE?.focus();
}

/** Updates the setup progress and availability of the start button. */
function updateSettingsState(): void {
  const hasTheme: boolean = setStepState('theme_step', 'theme');
  const hasPlayer: boolean = setStepState('player_step', 'player');
  const hasBoard: boolean = setStepState('board_step', 'board_size');

  if (START_BUTTON instanceof HTMLButtonElement) {
    START_BUTTON.disabled = !(hasTheme && hasPlayer && hasBoard);
  }
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

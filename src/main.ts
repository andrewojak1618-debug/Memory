import './styles/style.scss';

const HOME_VIEW = document.getElementById('home-view');
const SETTINGS_VIEW = document.getElementById('settings-view');
const SETTINGS_TITLE = document.getElementById('settings-title');
const PLAY_BUTTON = document.getElementById('play-button');

/** Connects the available controls with their actions. */
function init(): void {
  PLAY_BUTTON?.addEventListener('click', showSettings);
}

/** Opens the settings view and places focus on its heading. */
function showSettings(): void {
  if (!HOME_VIEW || !SETTINGS_VIEW) return;

  HOME_VIEW.hidden = true;
  SETTINGS_VIEW.hidden = false;
  SETTINGS_TITLE?.focus();
}

init();

const QUIT_DIALOG: HTMLElement | null = document.getElementById('quit_dialog');
const EXIT_BUTTON: HTMLElement | null = document.getElementById('exit_button');
const BACK_TO_GAME: HTMLElement | null = document.getElementById('back_to_game');
const CONFIRM_EXIT: HTMLElement | null = document.getElementById('confirm_exit');
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const SETTINGS_VIEW: HTMLElement | null = document.getElementById('settings_view');

/** Connects the confirmation without ending the game prematurely. */
export function initQuitDialog(): void {
  EXIT_BUTTON?.addEventListener('click', openQuitDialog);
  BACK_TO_GAME?.addEventListener('click', closeQuitDialog);
  CONFIRM_EXIT?.addEventListener('click', returnToSettings);
  QUIT_DIALOG?.addEventListener('close', restoreExitFocus);
}

/** Uses native modality to keep keyboard focus within the popup. */
function openQuitDialog(): void {
  if (!(QUIT_DIALOG instanceof HTMLDialogElement) || QUIT_DIALOG.open) return;
  QUIT_DIALOG.showModal();
  document.getElementById('quit_title')?.focus();
}

/** Dismisses the confirmation while preserving the current game. */
function closeQuitDialog(): void {
  if (QUIT_DIALOG instanceof HTMLDialogElement) QUIT_DIALOG.close();
}

/** Leaves the game view while preserving the chosen settings. */
function returnToSettings(): void {
  if (!GAME_VIEW || !SETTINGS_VIEW) return;
  closeQuitDialog();
  GAME_VIEW.hidden = true;
  SETTINGS_VIEW.hidden = false;
  document.getElementById('settings_title')?.focus();
}

/** Restores focus to the visible view after the native close event. */
function restoreExitFocus(): void {
  if (GAME_VIEW?.hidden) document.getElementById('settings_title')?.focus();
  else EXIT_BUTTON?.focus();
}

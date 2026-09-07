import { getCurrentPlayerIcon } from './game-theme';
import type { GameTheme, PlayerColor } from './theme-data';

const PLAYER_ASSIGNMENT_STATUS: HTMLElement | null = document.getElementById('player_assignment');
const CURRENT_PLAYER_ICON: HTMLElement | null = document.getElementById('current_player_icon');
const PLAYER_ICON_DIRECTORY: string = './assets/icons';
const INITIAL_SCORE: string = '0';

/** Updates both player assignments and the game's starting-player symbol. */
export function updatePlayerAssignment(): void {
  const playerOne: PlayerColor | null = getSelectedPlayerColor();
  const playerTwo: PlayerColor | null = playerOne ? getOpponentColor(playerOne) : null;

  updateAssignmentStatus(playerOne, playerTwo);
}

/** Resets a newly opened game and applies its starting player. */
export function prepareGamePlayers(theme: GameTheme): void {
  const playerOne: PlayerColor | null = getSelectedPlayerColor();
  if (!playerOne) return;
  updateCurrentPlayerIcon(playerOne, theme);
  resetScore('orange');
  resetScore('blue');
}

/** Reads and validates the selected color from the player radio group. */
function getSelectedPlayerColor(): PlayerColor | null {
  const selected: Element | null = document.querySelector('input[name="player"]:checked');
  if (!(selected instanceof HTMLInputElement)) return null;
  return isPlayerColor(selected.value) ? selected.value : null;
}

/** Narrows a form value to one of the two supported player colors. */
function isPlayerColor(value: string): value is PlayerColor {
  return value === 'blue' || value === 'orange';
}

/** Returns the color that remains for Player 2. */
function getOpponentColor(playerOne: PlayerColor): PlayerColor {
  return playerOne === 'blue' ? 'orange' : 'blue';
}

/** Announces both assignments without adding visible design text. */
function updateAssignmentStatus(
  playerOne: PlayerColor | null,
  playerTwo: PlayerColor | null,
): void {
  if (!PLAYER_ASSIGNMENT_STATUS || !playerOne || !playerTwo) return;
  const firstColor: string = getColorLabel(playerOne);
  const secondColor: string = getColorLabel(playerTwo);
  PLAYER_ASSIGNMENT_STATUS.innerText = `Player 1: ${firstColor}. Player 2: ${secondColor}.`;
}

/** Converts the typed color value into its visible name. */
function getColorLabel(color: PlayerColor): string {
  return color === 'blue' ? 'Blue' : 'Orange';
}

/** Updates the shared current-player symbol for the chosen theme. */
function updateCurrentPlayerIcon(color: PlayerColor, theme: GameTheme): void {
  const label: string = `${getColorLabel(color)}, Player 1`;
  updatePlayerIcon(CURRENT_PLAYER_ICON, getCurrentPlayerIcon(theme, color), label);
}

/** Updates one current-player image if it is available. */
function updatePlayerIcon(element: HTMLElement | null, fileName: string, label: string): void {
  if (!(element instanceof HTMLImageElement)) return;
  element.src = `${PLAYER_ICON_DIRECTORY}/${fileName}`;
  element.alt = label;
}

/** Resets one score and its accessible group label. */
function resetScore(color: PlayerColor): void {
  const group: HTMLElement | null = document.getElementById(`${color}_score`);
  const score: HTMLElement | null = document.getElementById(`${color}_score_value`);
  if (score) score.textContent = INITIAL_SCORE;
  group?.setAttribute('aria-label', `${getColorLabel(color)} player score: ${INITIAL_SCORE}`);
}

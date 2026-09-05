type PlayerColor = 'blue' | 'orange';

const PLAYER_ASSIGNMENT_STATUS: HTMLElement | null = document.getElementById('player_assignment');
const CURRENT_PLAYER_ICON: HTMLElement | null = document.querySelector('.game__current_player_arrow');
const PLAYER_ICON_DIRECTORY: string = './assets/icons';

/** Updates both player assignments and the game's starting-player symbol. */
export function updatePlayerAssignment(): void {
  const playerOne: PlayerColor | null = getSelectedPlayerColor();
  const playerTwo: PlayerColor | null = playerOne ? getOpponentColor(playerOne) : null;

  updateAssignmentStatus(playerOne, playerTwo);
  updateCurrentPlayerIcon(playerOne);
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

/** Updates the visual and textual identity of the starting player. */
function updateCurrentPlayerIcon(color: PlayerColor | null): void {
  if (!(CURRENT_PLAYER_ICON instanceof HTMLImageElement) || !color) return;
  CURRENT_PLAYER_ICON.src = `${PLAYER_ICON_DIRECTORY}/${color}_player_arrow.svg`;
  CURRENT_PLAYER_ICON.alt = `${getColorLabel(color)}, Player 1`;
}

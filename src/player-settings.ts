type PlayerColor = 'blue' | 'orange';

const PLAYER_ASSIGNMENT_STATUS: HTMLElement | null = document.getElementById('player_assignment');
const CODE_CURRENT_PLAYER_ICON: HTMLElement | null = document.querySelector('.game__current_player_arrow');
const DA_CURRENT_PLAYER_ICON: HTMLElement | null = document.querySelector('.game__da_projects_current_player_icon');
const PLAYER_ICON_DIRECTORY: string = './assets/icons';
const INITIAL_SCORE: string = '0';

/** Updates both player assignments and the game's starting-player symbol. */
export function updatePlayerAssignment(): void {
  const playerOne: PlayerColor | null = getSelectedPlayerColor();
  const playerTwo: PlayerColor | null = playerOne ? getOpponentColor(playerOne) : null;

  updateAssignmentStatus(playerOne, playerTwo);
  updateCurrentPlayerIcons(playerOne);
}

/** Resets a newly opened game and applies its starting player. */
export function prepareGamePlayers(): void {
  const playerOne: PlayerColor | null = getSelectedPlayerColor();
  if (!playerOne) return;
  updateCurrentPlayerIcons(playerOne);
  resetScore('.game__code_vibes_header_left_content .theme_preview_header__blue_score');
  resetScore('.game__code_vibes_header_left_content .theme_preview_header__orange_score');
  resetDaScore('orange');
  resetDaScore('blue');
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

/** Updates both theme variants with the selected starting player. */
function updateCurrentPlayerIcons(color: PlayerColor | null): void {
  if (!color) return;
  const label: string = `${getColorLabel(color)}, Player 1`;
  updatePlayerIcon(CODE_CURRENT_PLAYER_ICON, `${color}_player_arrow.svg`, label);
  updatePlayerIcon(DA_CURRENT_PLAYER_ICON, `current_player_${color}_icon.svg`, label);
}

/** Updates one current-player image if it is available. */
function updatePlayerIcon(element: HTMLElement | null, fileName: string, label: string): void {
  if (!(element instanceof HTMLImageElement)) return;
  element.src = `${PLAYER_ICON_DIRECTORY}/${fileName}`;
  element.alt = label;
}

/** Resets one visible score value. */
function resetScore(selector: string): void {
  const score: Element | null = document.querySelector(selector);
  if (score) score.textContent = INITIAL_SCORE;
}

/** Resets a DA score and its accessible group label. */
function resetDaScore(color: PlayerColor): void {
  const selector: string = `.game__da_projects_score_${color}`;
  const group: Element | null = document.querySelector(selector);
  const score: Element | null = group?.querySelector('.game__da_projects_score_value') ?? null;
  if (score) score.textContent = INITIAL_SCORE;
  group?.setAttribute('aria-label', `${getColorLabel(color)} player score: ${INITIAL_SCORE}`);
}

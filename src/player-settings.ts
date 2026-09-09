import { getCurrentPlayerIcon } from './game-theme';
import {
  addPoint,
  createGameState,
  getWinner,
  hasTie,
  switchPlayer,
} from './game-state';
import type { GameState } from './game-state';
import type { GameTheme, PlayerColor } from './theme-data';

const PLAYER_ASSIGNMENT_STATUS: HTMLElement | null = document.getElementById('player_assignment');
const CURRENT_PLAYER_ICON: HTMLElement | null = document.getElementById('current_player_icon');
const PLAYER_ICON_DIRECTORY: string = './assets/icons';
let activeTheme: GameTheme | null = null;
let gameState: GameState | null = null;

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
  activeTheme = theme;
  gameState = createGameState(playerOne);
  updateCurrentPlayerIcon(playerOne, theme);
  updateAllScores();
}

/** Clears player state and scores after a confirmed game exit. */
export function resetGamePlayers(): void {
  activeTheme = null;
  gameState = null;
  updateAllScores();
}

/** Stores the active player and updates the theme-specific turn symbol. */
export function setCurrentPlayer(color: PlayerColor): void {
  if (!gameState) gameState = createGameState(color);
  else gameState.currentPlayer = color;
  if (!activeTheme) return;
  updateCurrentPlayerIcon(color, activeTheme);
}

/** Returns the color whose turn is currently active. */
export function getCurrentPlayer(): PlayerColor | null {
  return gameState?.currentPlayer ?? null;
}

/** Reports whether both players have the same score. */
export function hasTiedScore(): boolean {
  return gameState ? hasTie(gameState) : true;
}

/** Returns the leading color or no color when the scores are tied. */
export function getWinningPlayer(): PlayerColor | null {
  return gameState ? getWinner(gameState) : null;
}

/** Awards one point to the active player and returns the new score. */
export function addCurrentPlayerPoint(): number {
  if (!gameState) return 0;
  const score: number = addPoint(gameState);
  updateScore(gameState.currentPlayer);
  return score;
}

/** Ends the active turn and returns the opposing player's color. */
export function switchCurrentPlayer(): PlayerColor | null {
  if (!gameState) return null;
  const nextPlayer: PlayerColor = switchPlayer(gameState);
  if (activeTheme) updateCurrentPlayerIcon(nextPlayer, activeTheme);
  return nextPlayer;
}

/** Reads and validates the selected color from the player radio group. */
export function getSelectedPlayerColor(): PlayerColor | null {
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
  if (!PLAYER_ASSIGNMENT_STATUS) return;
  if (!playerOne || !playerTwo) {
    PLAYER_ASSIGNMENT_STATUS.textContent = '';
    return;
  }
  const firstColor: string = getColorLabel(playerOne);
  const secondColor: string = getColorLabel(playerTwo);
  PLAYER_ASSIGNMENT_STATUS.innerText = `Player 1: ${firstColor}. Player 2: ${secondColor}.`;
}

/** Converts the typed color value into its visible name. */
export function getColorLabel(color: PlayerColor): string {
  return color === 'blue' ? 'Blue' : 'Orange';
}

/** Updates the shared current-player symbol for the chosen theme. */
function updateCurrentPlayerIcon(color: PlayerColor, theme: GameTheme): void {
  const label: string = `${getColorLabel(color)} player's turn`;
  updatePlayerIcon(CURRENT_PLAYER_ICON, getCurrentPlayerIcon(theme, color), label);
}

/** Updates one current-player image if it is available. */
function updatePlayerIcon(element: HTMLElement | null, fileName: string, label: string): void {
  if (!(element instanceof HTMLImageElement)) return;
  element.src = `${PLAYER_ICON_DIRECTORY}/${fileName}`;
  element.alt = label;
}

/** Resets both player scores before a new game. */
function updateAllScores(): void {
  updateScore('blue');
  updateScore('orange');
}

/** Updates one visible score and its accessible group label. */
function updateScore(color: PlayerColor): void {
  const group: HTMLElement | null = document.getElementById(`${color}_score`);
  const score: HTMLElement | null = document.getElementById(`${color}_score_value`);
  const value: string = String(gameState?.scores[color] ?? 0);
  if (score) score.textContent = value;
  group?.setAttribute('aria-label', `${getColorLabel(color)} player score: ${value}`);
}

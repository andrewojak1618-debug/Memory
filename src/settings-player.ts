import { getColorLabel, getOpponentColor, isPlayerColor } from './player-color';
import type { PlayerColor } from './theme-data';

const PLAYER_ASSIGNMENT_STATUS: HTMLElement | null = document.getElementById('player_assignment');

/** Reads the player color selected in the settings form. */
export function getSelectedPlayerColor(): PlayerColor | null {
  const selected: Element | null = document.querySelector('input[name="player"]:checked');
  if (!(selected instanceof HTMLInputElement)) return null;
  return isPlayerColor(selected.value) ? selected.value : null;
}

/** Announces which colors belong to both players. */
export function updatePlayerAssignment(): void {
  const playerOne: PlayerColor | null = getSelectedPlayerColor();
  if (!PLAYER_ASSIGNMENT_STATUS) return;
  if (!playerOne) {
    PLAYER_ASSIGNMENT_STATUS.textContent = '';
    return;
  }
  const playerTwo: PlayerColor = getOpponentColor(playerOne);
  PLAYER_ASSIGNMENT_STATUS.innerText = `Player 1: ${getColorLabel(playerOne)}. Player 2: ${getColorLabel(playerTwo)}.`;
}

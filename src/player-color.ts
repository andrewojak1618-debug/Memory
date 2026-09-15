import type { PlayerColor } from './theme-data';

/** Narrows a form value to one supported player color.
 * @param value - The unchecked value from the settings form.
 */
export function isPlayerColor(value: string): value is PlayerColor {
  return value === 'blue' || value === 'orange';
}

/** Returns the color assigned to Player 2.
 * @param playerOne - The color selected for Player 1.
 */
export function getOpponentColor(playerOne: PlayerColor): PlayerColor {
  return playerOne === 'blue' ? 'orange' : 'blue';
}

/** Converts a player color to its visible label.
 * @param color - The player color to name.
 */
export function getColorLabel(color: PlayerColor): string {
  return color === 'blue' ? 'Blue' : 'Orange';
}

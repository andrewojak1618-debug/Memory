import { loadGameSetup } from './game-setup';
import type { GameSetup } from './game-setup';
import { getPlayerScore, getWinningPlayer } from './player-settings';
import { saveGameResult } from './result-data';
import type { GameResult } from './result-data';

const FINAL_CARD_REVEAL_DELAY_MS: number = 1200;
let resultTimer: number | null = null;

/** Keeps the last matched pair visible before leaving the board. */
export function showCompletedResult(): void {
  if (resultTimer !== null) return;
  resultTimer = window.setTimeout(openCompletedResult, FINAL_CARD_REVEAL_DELAY_MS);
}

/** Cancels a pending result when the game is abandoned. */
export function cancelResultTransition(): void {
  if (resultTimer !== null) window.clearTimeout(resultTimer);
  resultTimer = null;
}

/** Transfers final scores to the matching result page. */
function openCompletedResult(): void {
  resultTimer = null;
  const setup: GameSetup | null = loadGameSetup();
  if (!setup) return;
  const result: GameResult = {
    setup,
    scores: { blue: getPlayerScore('blue'), orange: getPlayerScore('orange') },
    winner: getWinningPlayer(),
  };
  saveGameResult(result);
  const destination: string = result.winner ? './game-over.html' : './draw.html';
  window.location.assign(destination);
}

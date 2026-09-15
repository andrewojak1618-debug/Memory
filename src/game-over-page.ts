import './styles/game-over-page.scss';
import { getColorLabel, getOpponentColor } from './player-color';
import { getDevelopmentResult } from './result-debug';
import { loadGameResult, saveGameResult } from './result-data';
import type { GameResult } from './result-data';
import type { PlayerColor } from './theme-data';

const GAME_OVER_VIEW: HTMLElement | null = document.getElementById('game_over_view');
const WINNER_TRANSITION_DELAY_MS: number = 4000;
const GAME_OVER_PLAYER_CLASSES: readonly string[] = ['is_blue', 'is_orange'];

/** Presents the final score before the winner page. */
function init(): void {
  const result: GameResult | null = getDevelopmentResult('game_over') ?? loadGameResult();
  if (!result?.winner) {
    window.location.replace('./settings.html');
    return;
  }
  saveGameResult(result);
  applyTheme(result);
  updateCodeVibesScores(result);
  updateDaProjectsScores(result);
  focusThemeTitle(result);
  window.setTimeout(openWinnerPage, WINNER_TRANSITION_DELAY_MS);
}

/** Changes only the theme modifier and accessible heading.
 * @param result - The completed round whose theme is shown.
 */
function applyTheme(result: GameResult): void {
  GAME_OVER_VIEW?.classList.remove('game_result_code_vibes', 'game_result_da_projects');
  GAME_OVER_VIEW?.classList.add(`game_result_${result.setup.theme}`);
  const titleId: string = result.setup.theme === 'da_projects'
    ? 'game_over_da_projects_title' : 'game_over_title';
  GAME_OVER_VIEW?.setAttribute('aria-labelledby', titleId);
}

/** Shows both colors in the selected player order.
 * @param result - The final scores and Player 1 choice.
 */
function updateCodeVibesScores(result: GameResult): void {
  const playerOne: PlayerColor = result.setup.player;
  updateCodeVibesPlayer('game_over_player_one', playerOne, result.scores[playerOne], 'Player 1');
  const playerTwo: PlayerColor = getOpponentColor(playerOne);
  updateCodeVibesPlayer('game_over_player_two', playerTwo, result.scores[playerTwo], 'Player 2');
}

/** Writes one final-score entry with its text and symbol.
 * @param id - The element prefix for one visible score entry.
 * @param color - The assigned player color.
 * @param score - The points won by this player.
 * @param playerName - The player order announced to assistive technology.
 */
function updateCodeVibesPlayer(id: string, color: PlayerColor, score: number, playerName: string): void {
  const item: HTMLElement | null = document.getElementById(id);
  const icon: HTMLElement | null = document.getElementById(`${id}_icon`);
  const label: HTMLElement | null = document.getElementById(`${id}_label`);
  const value: HTMLElement | null = document.getElementById(`${id}_score`);
  item?.classList.remove(...GAME_OVER_PLAYER_CLASSES);
  item?.classList.add(`is_${color}`);
  item?.setAttribute('aria-label', `${playerName}: ${getColorLabel(color)}, score: ${score}`);
  if (icon instanceof HTMLImageElement) icon.src = `./assets/icons/${color}_player_arrow.svg`;
  if (label) label.textContent = getColorLabel(color);
  if (value) value.textContent = String(score);
}

/** Writes the two fixed-color DA Projects scores.
 * @param result - The final scores to display.
 */
function updateDaProjectsScores(result: GameResult): void {
  updateDaProjectsScore('blue', result.scores.blue);
  updateDaProjectsScore('orange', result.scores.orange);
}

/** Updates one DA Projects pawn and accessible score.
 * @param color - The fixed score-group color.
 * @param score - The points earned by this player.
 */
function updateDaProjectsScore(color: PlayerColor, score: number): void {
  const item: HTMLElement | null = document.getElementById(`game_over_da_projects_${color}_score_item`);
  const value: HTMLElement | null = document.getElementById(`game_over_da_projects_${color}_score`);
  if (value) value.textContent = String(score);
  item?.setAttribute('aria-label', `${getColorLabel(color)} player score: ${score}`);
}

/** Moves keyboard focus to the theme's visible heading.
 * @param result - The completed round whose theme is shown.
 */
function focusThemeTitle(result: GameResult): void {
  const titleId: string = result.setup.theme === 'da_projects'
    ? 'game_over_da_projects_title' : 'game_over_title';
  document.getElementById(titleId)?.focus();
}

/** Opens the winner page after the score was readable. */
function openWinnerPage(): void {
  window.location.assign('./winner.html');
}

init();

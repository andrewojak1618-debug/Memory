import {
  BOARD_SIZES,
  CARD_COUNTS,
  CARDS_PER_PAIR,
  DEFAULT_BOARD_SIZE,
  createCards,
  isBoardSize,
} from './card-data';
import type { BoardSize, CardSymbol, MemoryCard } from './card-data';
import {
  addCurrentPlayerPoint,
  getColorLabel,
  getCurrentPlayer,
  getWinningPlayer,
  switchCurrentPlayer,
} from './player-settings';
import { showTieResult, showWinnerTransition } from './game-result';
import { THEME_CONFIGS } from './theme-data';
import type { GameTheme, GameThemeConfig, PlayerColor } from './theme-data';

type CardState = 'face_down' | 'face_up' | 'matched';

const CARD_IMAGE_PATH: string = './assets/images/';
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const GAME_CONTAINER: HTMLElement | null = document.getElementById('game_container');
const GAME_BOARD: HTMLElement | null = document.getElementById('game_board');
const GAME_STATUS: HTMLElement | null = document.getElementById('game_status');
const CARD_LIST_ELEMENT: HTMLElement | null = document.getElementById('game_card_list');
const CARD_LIST: HTMLOListElement | null = CARD_LIST_ELEMENT instanceof HTMLOListElement
  ? CARD_LIST_ELEMENT : null;
const BOARD_MODIFIERS: readonly string[] = BOARD_SIZES.map(
  (size: BoardSize): string => `game__container_${size}`,
);
const OPEN_CARDS: HTMLButtonElement[] = [];
const MISMATCH_REVEAL_DELAY_MS: number = 1000;
let boardLocked: boolean = false;
let mismatchTimer: number | null = null;

/** Connects the shared card list with its delegated click action. */
export function initGameBoard(): void {
  CARD_LIST?.addEventListener('click', handleCardClick);
}

/** Creates paired cards for the selected theme and board size. */
export function renderGameBoard(theme: GameTheme): void {
  if (!CARD_LIST) return;
  const config: GameThemeConfig = THEME_CONFIGS[theme];
  const boardSize: BoardSize = getSelectedBoardSize();
  const cards: MemoryCard[] = createCards(CARD_COUNTS[boardSize], config.symbols);
  resetTurnState();
  updateBoardClasses(boardSize);
  renderCards(cards, config.cardBackFileName);
  announceStartingPlayer();
}

/** Clears cards and pending comparisons after a confirmed game exit. */
export function resetGameBoard(): void {
  resetTurnState();
  if (CARD_LIST) CARD_LIST.innerHTML = '';
  if (GAME_STATUS) GAME_STATUS.textContent = '';
}

/** Replaces the shared board with its configured card buttons. */
function renderCards(cards: readonly MemoryCard[], backFileName: string): void {
  if (!CARD_LIST) return;
  CARD_LIST.innerHTML = '';
  cards.forEach((card: MemoryCard, index: number): void => {
    CARD_LIST.append(createCardItem(card, index, backFileName));
  });
}

/** Applies one consistent set of board-size modifiers. */
function updateBoardClasses(boardSize: BoardSize): void {
  if (GAME_BOARD) GAME_BOARD.className = `game__board game__board_${boardSize}`;
  if (CARD_LIST) CARD_LIST.className = `game__card_list game__card_list_${boardSize}`;
  GAME_CONTAINER?.classList.remove(...BOARD_MODIFIERS);
  if (boardSize !== DEFAULT_BOARD_SIZE) GAME_CONTAINER?.classList.add(`game__container_${boardSize}`);
  updateGameSpacing(boardSize);
}

/** Applies the page spacing belonging to one board size. */
function updateGameSpacing(boardSize: BoardSize): void {
  GAME_VIEW?.classList.remove('game_4x6', 'game_6x6');
  if (boardSize !== DEFAULT_BOARD_SIZE) GAME_VIEW?.classList.add(`game_${boardSize}`);
}

/** Reads and validates the selected board size. */
function getSelectedBoardSize(): BoardSize {
  const selected: Element | null = document.querySelector('input[name="board_size"]:checked');
  if (!(selected instanceof HTMLInputElement)) return DEFAULT_BOARD_SIZE;
  return isBoardSize(selected.value) ? selected.value : DEFAULT_BOARD_SIZE;
}

/** Creates one semantic list item containing a card button. */
function createCardItem(card: MemoryCard, index: number, backFileName: string): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = 'game__card_item';
  item.append(createCardButton(card, index + 1, backFileName));
  return item;
}

/** Creates an accessible two-sided memory card. */
function createCardButton(card: MemoryCard, position: number, backFileName: string): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.className = 'game__card';
  button.type = 'button';
  button.dataset.card_name = card.symbol.name;
  button.dataset.card_position = String(position);
  button.setAttribute('aria-label', `Face-down memory card ${position}`);
  button.setAttribute('aria-pressed', 'false');
  button.append(createCardInner(card.symbol, backFileName));
  return button;
}

/** Creates the rotating element with both card faces. */
function createCardInner(symbol: CardSymbol, backFileName: string): HTMLSpanElement {
  const inner: HTMLSpanElement = document.createElement('span');
  inner.className = 'game__card_inner';
  inner.append(createCardFace('back', `${CARD_IMAGE_PATH}${backFileName}`));
  inner.append(createCardFace('front', `${CARD_IMAGE_PATH}${symbol.fileName}`));
  return inner;
}

/** Creates one decorative image face inside an accessible button. */
function createCardFace(side: string, source: string): HTMLSpanElement {
  const face: HTMLSpanElement = document.createElement('span');
  const image: HTMLImageElement = document.createElement('img');
  face.className = `game__card_face game__card_face_${side}`;
  image.className = 'game__card_image';
  image.src = source;
  image.alt = '';
  image.decoding = 'async';
  face.append(image);
  return face;
}

/** Opens an available card and evaluates every completed selection. */
function handleCardClick(event: MouseEvent): void {
  const card: HTMLButtonElement | null = getClickedCard(event);
  if (!canFlipCard(card)) return;
  setCardState(card, 'face_up');
  OPEN_CARDS.push(card);
  if (OPEN_CARDS.length === CARDS_PER_PAIR) resolveSelectedPair();
}

/** Finds a card button from any clicked element inside it. */
function getClickedCard(event: MouseEvent): HTMLButtonElement | null {
  if (!(event.target instanceof Element)) return null;
  return event.target.closest<HTMLButtonElement>('.game__card');
}

/** Allows only one unopened card from the active, unlocked board. */
function canFlipCard(card: HTMLButtonElement | null): card is HTMLButtonElement {
  if (!card || !CARD_LIST?.contains(card) || boardLocked) return false;
  return !card.disabled && !card.classList.contains('is_flipped');
}

/** Resolves the two selected cards as a match or a failed turn. */
function resolveSelectedPair(): void {
  const firstCard: HTMLButtonElement | undefined = OPEN_CARDS[0];
  const secondCard: HTMLButtonElement | undefined = OPEN_CARDS[1];
  if (!firstCard || !secondCard) return;
  if (cardsMatch(firstCard, secondCard)) completeMatchingPair();
  else scheduleMismatch();
}

/** Checks whether both selected cards contain the same motif. */
function cardsMatch(firstCard: HTMLButtonElement, secondCard: HTMLButtonElement): boolean {
  return firstCard.dataset.card_name === secondCard.dataset.card_name;
}

/** Keeps a found pair visible, awards a point, and retains the turn. */
function completeMatchingPair(): void {
  OPEN_CARDS.forEach((card: HTMLButtonElement): void => setCardState(card, 'matched'));
  const player: PlayerColor | null = getCurrentPlayer();
  const score: number = addCurrentPlayerPoint();
  clearOpenCards();
  if (player) announcePair(player, score);
  showResultWhenComplete();
}

/** Opens the available result view after every card has been matched. */
function showResultWhenComplete(): void {
  if (!isBoardComplete()) return;
  const winner: PlayerColor | null = getWinningPlayer();
  if (!winner) showTieResult();
  else showWinnerTransition(winner);
}

/** Checks whether no unmatched card remains on the board. */
function isBoardComplete(): boolean {
  if (!CARD_LIST) return false;
  return CARD_LIST.querySelector('.game__card:not(.is_matched)') === null;
}

/** Keeps a failed pair visible briefly before ending the turn. */
function scheduleMismatch(): void {
  boardLocked = true;
  mismatchTimer = window.setTimeout(finishMismatch, MISMATCH_REVEAL_DELAY_MS);
}

/** Closes a failed pair and hands the turn to the other player. */
function finishMismatch(): void {
  OPEN_CARDS.forEach((card: HTMLButtonElement): void => setCardState(card, 'face_down'));
  clearOpenCards();
  boardLocked = false;
  mismatchTimer = null;
  const nextPlayer: PlayerColor | null = switchCurrentPlayer();
  if (nextPlayer) announce(`${getColorLabel(nextPlayer)} player's turn.`);
}

/** Applies the visual, interactive, and spoken state of one card. */
function setCardState(card: HTMLButtonElement, state: CardState): void {
  const isFaceUp: boolean = state !== 'face_down';
  card.classList.toggle('is_flipped', isFaceUp);
  card.classList.toggle('is_matched', state === 'matched');
  card.disabled = state === 'matched';
  updateCardAccessibility(card, state);
}

/** Keeps the spoken card state synchronized with the visual state. */
function updateCardAccessibility(card: HTMLButtonElement, state: CardState): void {
  const name: string = card.dataset.card_name ?? 'Memory symbol';
  const position: string = card.dataset.card_position ?? '';
  const label: string = getCardLabel(name, position, state);
  card.setAttribute('aria-pressed', String(state !== 'face_down'));
  card.setAttribute('aria-label', label);
}

/** Builds the accessible label belonging to one card state. */
function getCardLabel(name: string, position: string, state: CardState): string {
  if (state === 'matched') return `${name}, matched card ${position}`;
  if (state === 'face_up') return `${name}, card ${position}`;
  return `Face-down memory card ${position}`;
}

/** Clears any pending comparison before a new game is rendered. */
function resetTurnState(): void {
  if (mismatchTimer !== null) window.clearTimeout(mismatchTimer);
  mismatchTimer = null;
  boardLocked = false;
  clearOpenCards();
}

/** Removes both cards from the current selection. */
function clearOpenCards(): void {
  OPEN_CARDS.splice(0, OPEN_CARDS.length);
}

/** Announces which selected player starts the new game. */
function announceStartingPlayer(): void {
  const player: PlayerColor | null = getCurrentPlayer();
  if (player) announce(`${getColorLabel(player)} player starts.`);
}

/** Announces a match, its score, and the retained turn. */
function announcePair(player: PlayerColor, score: number): void {
  const label: string = getColorLabel(player);
  announce(`${label} found a pair. Score: ${score}. ${label} plays again.`);
}

/** Sends one concise game update to assistive technology. */
function announce(message: string): void {
  if (GAME_STATUS) GAME_STATUS.textContent = message;
}

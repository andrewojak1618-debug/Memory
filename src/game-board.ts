import { BOARD_SIZES, CARD_COUNTS, DEFAULT_BOARD_SIZE, createCards, isBoardSize } from './card-data';
import type { BoardSize, CardSymbol, MemoryCard } from './card-data';
import { THEME_CONFIGS } from './theme-data';
import type { GameTheme, GameThemeConfig } from './theme-data';

const CARD_IMAGE_PATH: string = './assets/images/';
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const GAME_CONTAINER: HTMLElement | null = document.getElementById('game_container');
const GAME_BOARD: HTMLElement | null = document.getElementById('game_board');
const CARD_LIST_ELEMENT: HTMLElement | null = document.getElementById('game_card_list');
const CARD_LIST: HTMLOListElement | null = CARD_LIST_ELEMENT instanceof HTMLOListElement
  ? CARD_LIST_ELEMENT : null;
const BOARD_MODIFIERS: readonly string[] = BOARD_SIZES.map(
  (size: BoardSize): string => `game__container_${size}`,
);

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
  updateBoardClasses(boardSize);
  renderCards(cards, config.cardBackFileName);
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

/** Toggles only the card activated inside the shared list. */
function handleCardClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  const card: HTMLButtonElement | null = event.target.closest<HTMLButtonElement>('.game__card');
  if (!card || !CARD_LIST?.contains(card)) return;
  const isFlipped: boolean = card.classList.toggle('is_flipped');
  updateCardAccessibility(card, isFlipped);
}

/** Keeps the spoken card state synchronized with the visual state. */
function updateCardAccessibility(card: HTMLButtonElement, isFlipped: boolean): void {
  const name: string = card.dataset.card_name ?? 'Memory symbol';
  const position: string = card.dataset.card_position ?? '';
  const label: string = isFlipped ? `${name}, card ${position}` : `Face-down memory card ${position}`;
  card.setAttribute('aria-pressed', String(isFlipped));
  card.setAttribute('aria-label', label);
}

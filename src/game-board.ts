type BoardSize = '4x4' | '4x6' | '6x6';

interface CardSymbol {
  readonly name: string;
  readonly fileName: string;
}

interface MemoryCard {
  readonly symbol: CardSymbol;
}

interface BoardCardCounts {
  readonly '4x4': number;
  readonly '4x6': number;
  readonly '6x6': number;
}

const DEFAULT_BOARD_SIZE: BoardSize = '4x4';
const CARDS_PER_PAIR: number = 2;
const CARD_IMAGE_PATH: string = './assets/images/';
const CARD_BACK_PATH: string = `${CARD_IMAGE_PATH}code_vibes_card_back.png`;
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const GAME_CONTAINER: HTMLElement | null = document.getElementById('game_code_vibes_container');
const GAME_BOARD: HTMLElement | null = document.getElementById('game_board');
const GAME_CARD_LIST_ELEMENT: HTMLElement | null = document.getElementById('game_card_list');
const GAME_CARD_LIST: HTMLOListElement | null = GAME_CARD_LIST_ELEMENT instanceof HTMLOListElement
  ? GAME_CARD_LIST_ELEMENT : null;
const CARD_COUNTS: BoardCardCounts = {
  '4x4': 16,
  '4x6': 24,
  '6x6': 36,
};
const CARD_SYMBOLS: readonly CardSymbol[] = [
  { name: 'Angular', fileName: 'angular_logo.png' },
  { name: 'Bootstrap', fileName: 'bootstrap_logo.png' },
  { name: 'CSS', fileName: 'css_logo.png' },
  { name: 'Database', fileName: 'database_icon.png' },
  { name: 'Django', fileName: 'django_logo.png' },
  { name: 'Firebase', fileName: 'firebase_logo.png' },
  { name: 'Git', fileName: 'git_logo.png' },
  { name: 'GitHub', fileName: 'github_logo.png' },
  { name: 'HTML', fileName: 'html_logo.png' },
  { name: 'React', fileName: 'react_logo.png' },
  { name: 'JavaScript', fileName: 'javascript_logo.png' },
  { name: 'Node.js', fileName: 'nodejs_logo.png' },
  { name: 'Python', fileName: 'python_logo.png' },
  { name: 'Sass', fileName: 'sass_logo.png' },
  { name: 'Terminal', fileName: 'terminal_icon.png' },
  { name: 'TypeScript', fileName: 'typescript_logo.png' },
  { name: 'Vue', fileName: 'vue_logo.png' },
  { name: 'Visual Studio Code', fileName: 'visual_studio_code_logo.png' },
];

/** Connects the card list with its delegated click action. */
export function initGameBoard(): void {
  GAME_CARD_LIST?.addEventListener('click', handleCardClick);
}

/** Creates paired cards for the currently selected board size. */
export function renderGameBoard(): void {
  if (!GAME_CARD_LIST) return;

  const boardSize: BoardSize = getSelectedBoardSize();
  const cards: MemoryCard[] = createCards(CARD_COUNTS[boardSize]);
  updateBoardClasses(boardSize);
  GAME_CARD_LIST.innerHTML = '';
  cards.forEach((card: MemoryCard, index: number): void => {
    GAME_CARD_LIST.append(createCardItem(card, index));
  });
}

/** Applies the layout classes belonging to one board size. */
function updateBoardClasses(boardSize: BoardSize): void {
  if (GAME_BOARD) GAME_BOARD.className = `game__board game__board_${boardSize}`;
  GAME_CARD_LIST?.classList.remove('game__card_list_4x4', 'game__card_list_4x6', 'game__card_list_6x6');
  GAME_CARD_LIST?.classList.add(`game__card_list_${boardSize}`);
  if (boardSize === '6x6') GAME_CONTAINER?.classList.add('game__code_vibes_container_6x6');
  else GAME_CONTAINER?.classList.remove('game__code_vibes_container_6x6');
  GAME_VIEW?.classList.remove('game_4x6', 'game_6x6');
  if (boardSize === '4x6') GAME_VIEW?.classList.add('game_4x6');
  if (boardSize === '6x6') GAME_VIEW?.classList.add('game_6x6');
}

/** Reads and validates the selected board size. */
function getSelectedBoardSize(): BoardSize {
  const selected: Element | null = document.querySelector('input[name="board_size"]:checked');
  if (!(selected instanceof HTMLInputElement)) return DEFAULT_BOARD_SIZE;

  return isBoardSize(selected.value) ? selected.value : DEFAULT_BOARD_SIZE;
}

/** Narrows a form value to one supported board size. */
function isBoardSize(value: string): value is BoardSize {
  return value === '4x4' || value === '4x6' || value === '6x6';
}

/** Builds two cards for every selected symbol. */
function createCards(cardCount: number): MemoryCard[] {
  const pairCount: number = cardCount / CARDS_PER_PAIR;
  const selectedSymbols: readonly CardSymbol[] = CARD_SYMBOLS.slice(0, pairCount);
  if (!hasValidSymbols(selectedSymbols, pairCount)) return [];

  const cards: MemoryCard[] = createCardPairs(selectedSymbols);
  return hasValidPairs(cards, selectedSymbols) ? cards : [];
}

/** Rejects missing motifs and repeated motif names. */
function hasValidSymbols(symbols: readonly CardSymbol[], pairCount: number): boolean {
  const symbolNames: string[] = [];
  if (symbols.length !== pairCount) return false;

  for (let index: number = 0; index < symbols.length; index += 1) {
    const symbol: CardSymbol | undefined = symbols[index];
    if (!symbol || symbolNames.includes(symbol.name)) return false;
    symbolNames.push(symbol.name);
  }
  return true;
}

/** Creates the configured number of copies for every motif. */
function createCardPairs(symbols: readonly CardSymbol[]): MemoryCard[] {
  const cards: MemoryCard[] = [];

  for (let copyIndex: number = 0; copyIndex < CARDS_PER_PAIR; copyIndex += 1) {
    symbols.forEach((symbol: CardSymbol): void => {
      cards.push({ symbol });
    });
  }
  return cards;
}

/** Ensures that every selected motif occurs in one complete pair. */
function hasValidPairs(cards: readonly MemoryCard[], symbols: readonly CardSymbol[]): boolean {
  if (cards.length !== symbols.length * CARDS_PER_PAIR) return false;

  for (let index: number = 0; index < symbols.length; index += 1) {
    const symbol: CardSymbol | undefined = symbols[index];
    if (!symbol) return false;
    const name: string = symbol.name;
    const copies: MemoryCard[] = cards.filter((card: MemoryCard): boolean => card.symbol.name === name);
    if (copies.length !== CARDS_PER_PAIR) return false;
  }
  return true;
}

/** Creates one semantic list item containing a card button. */
function createCardItem(card: MemoryCard, index: number): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = 'game__card_item';
  item.append(createCardButton(card, index + 1));
  return item;
}

/** Creates an accessible two-sided memory card. */
function createCardButton(card: MemoryCard, position: number): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.className = 'game__card';
  button.type = 'button';
  button.dataset.card_name = card.symbol.name;
  button.dataset.card_position = String(position);
  button.setAttribute('aria-label', `Face-down memory card ${position}`);
  button.setAttribute('aria-pressed', 'false');
  button.append(createCardInner(card.symbol));
  return button;
}

/** Creates the rotating element with both card faces. */
function createCardInner(symbol: CardSymbol): HTMLSpanElement {
  const inner: HTMLSpanElement = document.createElement('span');
  inner.className = 'game__card_inner';
  inner.append(createCardFace('back', CARD_BACK_PATH));
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
  face.append(image);
  return face;
}

/** Toggles only the card activated inside the shared list. */
function handleCardClick(event: MouseEvent): void {
  if (!(event.target instanceof Element) || !GAME_CARD_LIST) return;

  const card: HTMLButtonElement | null = event.target.closest<HTMLButtonElement>('.game__card');
  if (!card || !GAME_CARD_LIST.contains(card)) return;

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

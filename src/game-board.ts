import {
  CARD_COUNTS,
  DEFAULT_BOARD_SIZE,
  createCards,
  isBoardSize,
} from './card-data';
import type { BoardSize, CardSymbol, MemoryCard } from './card-data';

const CARD_IMAGE_PATH: string = './assets/images/';
const CARD_BACK_PATH: string = `${CARD_IMAGE_PATH}code_vibes_card_back.png`;
const DA_PROJECTS_CARD_BACK_PATH: string = `${CARD_IMAGE_PATH}da_projects_card_back.png`;
const GAME_VIEW: HTMLElement | null = document.getElementById('game_view');
const GAME_CONTAINER: HTMLElement | null = document.getElementById('game_code_vibes_container');
const GAME_BOARD: HTMLElement | null = document.getElementById('game_board');
const DA_PROJECTS_BOARD: HTMLElement | null = document.getElementById('da_projects_board');
const DA_PROJECTS_CONTENT: HTMLElement | null = document.querySelector('.game__da_projects_content');
const GAME_CARD_LIST_ELEMENT: HTMLElement | null = document.getElementById('game_card_list');
const DA_PROJECTS_CARD_LIST_ELEMENT: HTMLElement | null = document.getElementById('da_projects_card_list');
const GAME_CARD_LIST: HTMLOListElement | null = GAME_CARD_LIST_ELEMENT instanceof HTMLOListElement
  ? GAME_CARD_LIST_ELEMENT : null;
const DA_PROJECTS_CARD_LIST: HTMLOListElement | null = DA_PROJECTS_CARD_LIST_ELEMENT instanceof HTMLOListElement
  ? DA_PROJECTS_CARD_LIST_ELEMENT : null;
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
const DA_PROJECTS_CARD_SYMBOLS: readonly CardSymbol[] = [
  { name: 'Blue Arrow', fileName: 'da_projects_blue_arrow.png' },
  { name: 'Change Coin', fileName: 'da_projects_change_coin.png' },
  { name: 'Code a Cuisine', fileName: 'da_projects_code_a_cuisine.png' },
  { name: 'Cooking World', fileName: 'da_projects_cooking_world.png' },
  { name: 'DA Bubble', fileName: 'da_projects_da_bubble.png' },
  { name: 'Egg', fileName: 'da_projects_egg.png' },
  { name: 'El Pollo Loco', fileName: 'da_projects_el_pollo_loco.png' },
  { name: 'Green Button', fileName: 'da_projects_green_button.png' },
  { name: 'Join', fileName: 'da_projects_join.png' },
  { name: 'Ordering App', fileName: 'da_projects_ordering_app.png' },
  { name: 'Pokedex', fileName: 'da_projects_pokedex.png' },
  { name: 'Purple Person', fileName: 'da_projects_purple_person.png' },
  { name: 'Ramen', fileName: 'da_projects_ramen.png' },
  { name: 'Sakura', fileName: 'da_projects_sakura.png' },
  { name: 'Shark Fin', fileName: 'da_projects_shark_fin.png' },
  { name: 'Soup', fileName: 'da_projects_soup.png' },
  { name: 'Tic-Tac-Toe', fileName: 'da_projects_tic_tac_toe.png' },
  { name: 'Yellow Smiley', fileName: 'da_projects_yellow_smiley.png' },
];

/** Connects the card list with its delegated click action. */
export function initGameBoard(): void {
  GAME_CARD_LIST?.addEventListener('click', handleCardClick);
  DA_PROJECTS_CARD_LIST?.addEventListener('click', handleCardClick);
}

/** Creates paired cards for the currently selected board size. */
export function renderGameBoard(showDaProjects: boolean = false): void {
  const cardList: HTMLOListElement | null = showDaProjects ? DA_PROJECTS_CARD_LIST : GAME_CARD_LIST;
  const symbols: readonly CardSymbol[] = showDaProjects ? DA_PROJECTS_CARD_SYMBOLS : CARD_SYMBOLS;
  const backPath: string = showDaProjects ? DA_PROJECTS_CARD_BACK_PATH : CARD_BACK_PATH;
  if (!cardList) return;
  const boardSize: BoardSize = getSelectedBoardSize();
  const cardCount: number = CARD_COUNTS[boardSize];
  const cards: MemoryCard[] = createCards(cardCount, symbols);
  if (showDaProjects) updateDaBoardClasses(boardSize);
  else updateBoardClasses(boardSize);
  renderCards(cardList, cards, backPath);
}

/** Replaces one board with its configured card buttons. */
function renderCards(cardList: HTMLOListElement, cards: readonly MemoryCard[], backPath: string): void {
  cardList.innerHTML = '';
  cards.forEach((card: MemoryCard, index: number): void => {
    cardList.append(createCardItem(card, index, backPath));
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

/** Applies the selected size to the DA Projects board. */
function updateDaBoardClasses(boardSize: BoardSize): void {
  if (DA_PROJECTS_BOARD) {
    DA_PROJECTS_BOARD.className = `game__da_projects_board game__da_projects_board_${boardSize}`;
  }
  DA_PROJECTS_CARD_LIST?.classList.remove(
    'game__da_projects_card_list_4x4', 'game__da_projects_card_list_4x6', 'game__da_projects_card_list_6x6',
  );
  DA_PROJECTS_CARD_LIST?.classList.add(`game__da_projects_card_list_${boardSize}`);
  DA_PROJECTS_CONTENT?.classList.toggle('game__da_projects_content_6x6', boardSize === '6x6');
}

/** Reads and validates the selected board size. */
function getSelectedBoardSize(): BoardSize {
  const selected: Element | null = document.querySelector('input[name="board_size"]:checked');
  if (!(selected instanceof HTMLInputElement)) return DEFAULT_BOARD_SIZE;

  return isBoardSize(selected.value) ? selected.value : DEFAULT_BOARD_SIZE;
}

/** Creates one semantic list item containing a card button. */
function createCardItem(card: MemoryCard, index: number, backPath: string): HTMLLIElement {
  const item: HTMLLIElement = document.createElement('li');
  item.className = 'game__card_item';
  item.append(createCardButton(card, index + 1, backPath));
  return item;
}

/** Creates an accessible two-sided memory card. */
function createCardButton(card: MemoryCard, position: number, backPath: string): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.className = 'game__card';
  button.type = 'button';
  button.dataset.card_name = card.symbol.name;
  button.dataset.card_position = String(position);
  button.setAttribute('aria-label', `Face-down memory card ${position}`);
  button.setAttribute('aria-pressed', 'false');
  button.append(createCardInner(card.symbol, backPath));
  return button;
}

/** Creates the rotating element with both card faces. */
function createCardInner(symbol: CardSymbol, backPath: string): HTMLSpanElement {
  const inner: HTMLSpanElement = document.createElement('span');
  inner.className = 'game__card_inner';
  inner.append(createCardFace('back', backPath));
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
  if (!(event.target instanceof Element)) return;
  const cardList: EventTarget | null = event.currentTarget;
  if (!(cardList instanceof HTMLOListElement)) return;

  const card: HTMLButtonElement | null = event.target.closest<HTMLButtonElement>('.game__card');
  if (!card || !cardList.contains(card)) return;

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

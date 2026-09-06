export type BoardSize = '4x4' | '4x6' | '6x6';

export interface CardSymbol {
  readonly name: string;
  readonly fileName: string;
}

export interface MemoryCard {
  readonly symbol: CardSymbol;
}

export const CARDS_PER_PAIR: number = 2;
export const DEFAULT_BOARD_SIZE: BoardSize = '4x4';
export const BOARD_SIZES: readonly BoardSize[] = ['4x4', '4x6', '6x6'];
export const CARD_COUNTS: Readonly<Record<BoardSize, number>> = {
  '4x4': 16,
  '4x6': 24,
  '6x6': 36,
};

/** Narrows a form value to one supported board size. */
export function isBoardSize(value: string): value is BoardSize {
  return BOARD_SIZES.some((boardSize: BoardSize): boolean => boardSize === value);
}

/** Builds one complete pair for every required symbol. */
export function createCards(cardCount: number, symbols: readonly CardSymbol[]): MemoryCard[] {
  const pairCount: number = cardCount / CARDS_PER_PAIR;
  const selectedSymbols: readonly CardSymbol[] = symbols.slice(0, pairCount);
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
    if (!symbol || countCopies(cards, symbol.name) !== CARDS_PER_PAIR) return false;
  }
  return true;
}

/** Counts the cards belonging to one motif. */
function countCopies(cards: readonly MemoryCard[], name: string): number {
  return cards.filter((card: MemoryCard): boolean => card.symbol.name === name).length;
}

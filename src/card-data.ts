export type BoardSize = '4x4' | '4x6' | '6x6';

export interface CardSymbol {
  readonly name: string;
  readonly fileName: string;
}

export interface MemoryCard {
  readonly symbol: CardSymbol;
}

export type RandomGenerator = () => number;

export const CARDS_PER_PAIR: number = 2;
export const DEFAULT_BOARD_SIZE: BoardSize = '4x4';
export const BOARD_SIZES: readonly BoardSize[] = ['4x4', '4x6', '6x6'];
export const CARD_COUNTS: Readonly<Record<BoardSize, number>> = {
  '4x4': 16,
  '4x6': 24,
  '6x6': 36,
};

/**
 * Narrows a form value to one supported board size.
 * @param value - The unchecked value from the settings form.
 * @returns Whether the value is a supported board size.
 */
export function isBoardSize(value: string): value is BoardSize {
  return BOARD_SIZES.some((boardSize: BoardSize): boolean => boardSize === value);
}

/**
 * Builds one complete pair for every required symbol.
 * @param cardCount - The total number of cards required by the board.
 * @param symbols - The selected theme's available card motifs.
 * @param random - The random-number source used to shuffle the cards.
 * @returns A shuffled, validated card set or an empty array for invalid data.
 */
export function createCards(
  cardCount: number,
  symbols: readonly CardSymbol[],
  random: RandomGenerator = Math.random,
): MemoryCard[] {
  const pairCount: number = cardCount / CARDS_PER_PAIR;
  const selectedSymbols: readonly CardSymbol[] = symbols.slice(0, pairCount);
  if (!hasValidSymbols(selectedSymbols, pairCount)) return [];
  const cards: MemoryCard[] = createCardPairs(selectedSymbols);
  return hasValidPairs(cards, selectedSymbols) ? shuffleCards(cards, random) : [];
}

/**
 * Returns a shuffled copy without changing the validated card pairs.
 * @param cards - The validated cards to copy and shuffle.
 * @param random - The random-number source used by Fisher-Yates.
 * @returns A shuffled copy of the supplied cards.
 */
export function shuffleCards(
  cards: readonly MemoryCard[],
  random: RandomGenerator = Math.random,
): MemoryCard[] {
  const shuffledCards: MemoryCard[] = [...cards];
  for (let index: number = shuffledCards.length - 1; index > 0; index -= 1) {
    swapCards(shuffledCards, index, Math.floor(random() * (index + 1)));
  }
  return shuffledCards;
}

/**
 * Exchanges two positions during the Fisher-Yates shuffle.
 * @param cards - The mutable shuffled-card copy.
 * @param firstIndex - The first position to exchange.
 * @param secondIndex - The second position to exchange.
 */
function swapCards(cards: MemoryCard[], firstIndex: number, secondIndex: number): void {
  const firstCard: MemoryCard | undefined = cards[firstIndex];
  const secondCard: MemoryCard | undefined = cards[secondIndex];
  if (!firstCard || !secondCard) return;
  cards[firstIndex] = secondCard;
  cards[secondIndex] = firstCard;
}

/**
 * Rejects missing motifs and repeated motif names.
 * @param symbols - The theme motifs available for the board.
 * @param pairCount - The number of distinct pairs required.
 * @returns Whether enough uniquely named motifs are available.
 */
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

/**
 * Creates the configured number of copies for every motif.
 * @param symbols - The motifs selected for the current board.
 * @returns Two memory cards for each supplied motif.
 */
function createCardPairs(symbols: readonly CardSymbol[]): MemoryCard[] {
  const cards: MemoryCard[] = [];
  for (let copyIndex: number = 0; copyIndex < CARDS_PER_PAIR; copyIndex += 1) {
    symbols.forEach((symbol: CardSymbol): void => {
      cards.push({ symbol });
    });
  }
  return cards;
}

/**
 * Ensures that every selected motif occurs in one complete pair.
 * @param cards - The generated cards to validate.
 * @param symbols - The motifs that must each occur as one pair.
 * @returns Whether every motif occurs exactly twice.
 */
function hasValidPairs(cards: readonly MemoryCard[], symbols: readonly CardSymbol[]): boolean {
  if (cards.length !== symbols.length * CARDS_PER_PAIR) return false;
  for (let index: number = 0; index < symbols.length; index += 1) {
    const symbol: CardSymbol | undefined = symbols[index];
    if (!symbol || countCopies(cards, symbol.name) !== CARDS_PER_PAIR) return false;
  }
  return true;
}

/**
 * Counts the cards belonging to one motif.
 * @param cards - The cards to inspect.
 * @param name - The motif name whose copies are counted.
 * @returns The number of matching cards.
 */
function countCopies(cards: readonly MemoryCard[], name: string): number {
  return cards.filter((card: MemoryCard): boolean => card.symbol.name === name).length;
}

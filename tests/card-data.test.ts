import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  BOARD_SIZES,
  CARD_COUNTS,
  CARDS_PER_PAIR,
  createCards,
  shuffleCards,
} from '../src/card-data.ts';
import type { CardSymbol, MemoryCard } from '../src/card-data.ts';

const SYMBOL_COUNT: number = 18;
const SYMBOLS: readonly CardSymbol[] = Array.from(
  { length: SYMBOL_COUNT },
  (_value: unknown, index: number): CardSymbol => ({
    name: `Symbol ${index + 1}`,
    fileName: `symbol_${index + 1}.png`,
  }),
);

/** Counts every occurrence of one motif in a generated deck. */
function countCards(cards: readonly MemoryCard[], name: string): number {
  return cards.filter((card: MemoryCard): boolean => card.symbol.name === name).length;
}

test('creates complete pairs for every supported board size', (): void => {
  BOARD_SIZES.forEach((boardSize): void => {
    const cards: MemoryCard[] = createCards(CARD_COUNTS[boardSize], SYMBOLS);
    assert.equal(cards.length, CARD_COUNTS[boardSize]);
    const names: string[] = [...new Set(cards.map((card): string => card.symbol.name))];
    names.forEach((name: string): void => assert.equal(countCards(cards, name), CARDS_PER_PAIR));
  });
});

test('rejects decks without enough unique motifs', (): void => {
  const incompleteSymbols: readonly CardSymbol[] = SYMBOLS.slice(0, 7);
  assert.deepEqual(createCards(CARD_COUNTS['4x4'], incompleteSymbols), []);
});

test('shuffles generated pairs before they are rendered', (): void => {
  const cards: MemoryCard[] = createCards(CARD_COUNTS['4x4'], SYMBOLS, (): number => 0);
  const names: string[] = cards.map((card: MemoryCard): string => card.symbol.name);
  const orderedNames: string[] = [...SYMBOLS.slice(0, 8), ...SYMBOLS.slice(0, 8)]
    .map((symbol: CardSymbol): string => symbol.name);
  assert.notDeepEqual(names, orderedNames);
});

test('does not mutate the source collection while shuffling', (): void => {
  const cards: readonly MemoryCard[] = SYMBOLS.slice(0, 2).map(
    (symbol: CardSymbol): MemoryCard => ({ symbol }),
  );
  const shuffledCards: MemoryCard[] = shuffleCards(cards, (): number => 0);
  assert.deepEqual(cards.map((card: MemoryCard): string => card.symbol.name), ['Symbol 1', 'Symbol 2']);
  assert.deepEqual(shuffledCards.map((card: MemoryCard): string => card.symbol.name), ['Symbol 2', 'Symbol 1']);
});

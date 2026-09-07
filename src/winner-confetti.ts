interface ConfettiStyle {
  color: string;
  delay: number;
  drift: number;
  duration: number;
  left: number;
}

const CONFETTI_CONTAINER: HTMLElement | null = document.getElementById('winner_confetti');
const CONFETTI_COLORS: readonly string[] = ['#df0049', '#00e857', '#2bebbc', '#ffd200'];
const RIBBON_COLORS: readonly string[] = ['#ff001b', '#32b8f0', '#2bebbc', '#ffd200'];
const CONFETTI_COUNT: number = 36;
const RIBBON_COUNT: number = 8;
const MINIMUM_DURATION_SECONDS: number = 4;
const MAXIMUM_DURATION_SECONDS: number = 8;
const MAXIMUM_DELAY_SECONDS: number = 8;
const MAXIMUM_DRIFT_PIXELS: number = 80;

/** Creates the decorative pieces shared by both winner views once. */
export function initWinnerConfetti(): void {
  if (!CONFETTI_CONTAINER || CONFETTI_CONTAINER.childElementCount > 0) return;
  const fragment: DocumentFragment = document.createDocumentFragment();
  for (let index: number = 0; index < CONFETTI_COUNT; index += 1) {
    fragment.append(createConfettiPiece(index));
  }
  for (let index: number = 0; index < RIBBON_COUNT; index += 1) {
    fragment.append(createConfettiRibbon(index));
  }
  CONFETTI_CONTAINER.append(fragment);
}

/** Creates one typed decorative confetti piece. */
function createConfettiPiece(index: number): HTMLSpanElement {
  const piece: HTMLSpanElement = document.createElement('span');
  piece.className = 'game_result__confetti_piece';
  applyConfettiStyle(piece, createConfettiStyle(index));
  return piece;
}

/** Creates one larger curved confetti ribbon. */
function createConfettiRibbon(index: number): HTMLSpanElement {
  const ribbon: HTMLSpanElement = document.createElement('span');
  ribbon.className = 'game_result__confetti_ribbon';
  applyConfettiStyle(ribbon, createConfettiStyle(index, RIBBON_COLORS));
  return ribbon;
}

/** Produces bounded animation values for one confetti piece. */
function createConfettiStyle(
  index: number,
  colors: readonly string[] = CONFETTI_COLORS,
): ConfettiStyle {
  return {
    color: colors[index % colors.length],
    delay: -randomBetween(0, MAXIMUM_DELAY_SECONDS),
    drift: randomBetween(-MAXIMUM_DRIFT_PIXELS, MAXIMUM_DRIFT_PIXELS),
    duration: randomBetween(MINIMUM_DURATION_SECONDS, MAXIMUM_DURATION_SECONDS),
    left: randomBetween(0, 100),
  };
}

/** Transfers typed values to the CSS animation properties. */
function applyConfettiStyle(piece: HTMLSpanElement, style: ConfettiStyle): void {
  piece.style.setProperty('--confetti_color', style.color);
  piece.style.setProperty('--confetti_delay', `${style.delay}s`);
  piece.style.setProperty('--confetti_drift', `${style.drift}px`);
  piece.style.setProperty('--confetti_duration', `${style.duration}s`);
  piece.style.setProperty('--confetti_left', `${style.left}%`);
}

/** Returns a random decimal within the supplied boundaries. */
function randomBetween(minimum: number, maximum: number): number {
  return Math.random() * (maximum - minimum) + minimum;
}

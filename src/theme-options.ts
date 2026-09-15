export type GameTheme = 'code_vibes' | 'da_projects';
export type PlayerColor = 'blue' | 'orange';

export const GAME_THEMES: readonly GameTheme[] = ['code_vibes', 'da_projects'];
export const THEME_LABELS: Readonly<Record<GameTheme, string>> = {
  code_vibes: 'Code Vibes',
  da_projects: 'DA Projects',
};

/** Narrows a form value to one supported theme.
 * @param value - The unchecked value from the settings form.
 */
export function isGameTheme(value: string): value is GameTheme {
  return GAME_THEMES.some((theme: GameTheme): boolean => theme === value);
}

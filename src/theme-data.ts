import type { CardSymbol } from './card-data';

export type GameTheme = 'code_vibes' | 'da_projects';
export type PlayerColor = 'blue' | 'orange';

export interface GameThemeConfig {
  readonly label: string;
  readonly cardBackFileName: string;
  readonly symbols: readonly CardSymbol[];
  readonly scoreIcons: Readonly<Record<PlayerColor, string>>;
  readonly currentPlayerIcons: Readonly<Record<PlayerColor, string>>;
  readonly exitIconFileName: string;
}

export const GAME_THEMES: readonly GameTheme[] = ['code_vibes', 'da_projects'];

const CODE_VIBES_SYMBOLS: readonly CardSymbol[] = [
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

const DA_PROJECTS_SYMBOLS: readonly CardSymbol[] = [
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

export const THEME_CONFIGS: Readonly<Record<GameTheme, GameThemeConfig>> = {
  code_vibes: {
    label: 'Code Vibes',
    cardBackFileName: 'code_vibes_card_back.png',
    symbols: CODE_VIBES_SYMBOLS,
    scoreIcons: { blue: 'blue_player_arrow.svg', orange: 'orange_player_arrow.svg' },
    currentPlayerIcons: { blue: 'blue_player_arrow.svg', orange: 'orange_player_arrow.svg' },
    exitIconFileName: 'exit_game_white_icon.svg',
  },
  da_projects: {
    label: 'DA Projects',
    cardBackFileName: 'da_projects_card_back.png',
    symbols: DA_PROJECTS_SYMBOLS,
    scoreIcons: { blue: 'chess_pawn_blue.svg', orange: 'chess_pawn_orange.svg' },
    currentPlayerIcons: { blue: 'current_player_blue_icon.svg', orange: 'current_player_orange_icon.svg' },
    exitIconFileName: 'exit_game_blue_icon.svg',
  },
};

/** Narrows a form value to one supported game theme. */
export function isGameTheme(value: string): value is GameTheme {
  return GAME_THEMES.some((theme: GameTheme): boolean => theme === value);
}

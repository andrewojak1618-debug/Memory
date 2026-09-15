import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  input: {
    home: 'index.html',
    settings: 'settings.html',
    game: 'game.html',
    gameOver: 'game-over.html',
    draw: 'draw.html',
    winner: 'winner.html',
  },
});

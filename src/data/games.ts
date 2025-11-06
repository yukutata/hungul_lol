import { GameConfig } from '../types/character';

export const GAMES: GameConfig[] = [
  {
    id: 'lol',
    name: 'League of Legends',
    nameKo: 'LoL',
    description: 'League of Legendsのチャンピオン名でハングルを学習',
    themeColor: '#C89B3C',
    iconCount: 168
  },
  {
    id: 'eternal-return',
    name: 'Eternal Return',
    nameKo: 'エターナルリターン',
    description: 'エターナルリターンのキャラクター名でハングルを学習',
    themeColor: '#FF6B6B',
    iconCount: 84
  }
];

export const getGameConfig = (gameId: 'lol' | 'eternal-return'): GameConfig | undefined => {
  return GAMES.find(game => game.id === gameId);
};
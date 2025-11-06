// 汎用的なキャラクター型定義
export interface Character {
  id: string;
  nameKo: string;
  nameEn: string;
  iconUrl: string;
  game: 'lol' | 'eternal-return';
}

// ゲーム設定型定義
export interface GameConfig {
  id: 'lol' | 'eternal-return';
  name: string;
  nameKo: string;
  description: string;
  themeColor: string;
  iconCount: number;
}

// 旧型定義との互換性
export interface Champion extends Character {
  game: 'lol';
}

export interface ERCharacter extends Character {
  game: 'eternal-return';
}
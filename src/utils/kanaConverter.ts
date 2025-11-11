// ひらがな・カタカナ変換ユーティリティ

/**
 * ひらがなをカタカナに変換
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * カタカナをひらがなに変換
 */
export function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * 文字列がひらがなまたはカタカナを含むかチェック
 */
export function containsKana(str: string): boolean {
  return /[\u3041-\u3096\u30a1-\u30f6]/.test(str);
}

/**
 * 検索用：ひらがな・カタカナ両方でマッチングできるようにする
 */
export function normalizeKanaForSearch(str: string): string {
  // 全てカタカナに統一して比較
  return hiraganaToKatakana(str);
}
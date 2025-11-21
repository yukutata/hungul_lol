// Eternal Return API Client
// API Documentation: https://developer.eternalreturn.io/

const API_KEY = import.meta.env.VITE_ETERNAL_RETURN_API_KEY;
// 開発環境ではプロキシ経由、本番環境では直接アクセス（要サーバー実装）
const API_BASE_URL = import.meta.env.DEV
  ? '/api/eternal-return'
  : import.meta.env.VITE_ETERNAL_RETURN_API_BASE_URL || 'https://open-api.bser.io';

// API Response Types
interface ERCharacter {
  code: number;
  name: string;
  nameKr: string;
  nameJpn: string;
  nameEn: string;
  // 追加のフィールドは必要に応じて追加
}

interface ERApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// エラークラス
export class EternalReturnAPIError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'EternalReturnAPIError';
  }
}

// APIクライアントクラス
class EternalReturnAPI {
  private headers: HeadersInit;

  constructor() {
    if (!API_KEY) {
      console.warn('Eternal Return API key is not set. Some features may be limited.');
    }

    this.headers = {
      'accept': 'application/json',
      'x-api-key': API_KEY || '',
    };
  }

  // 汎用的なfetchメソッド
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      // 開発環境ではプロキシがヘッダーを追加するため、クライアント側では追加しない
      const headers = import.meta.env.DEV
        ? {
            'accept': 'application/json',
            ...options?.headers,
          }
        : {
            ...this.headers,
            ...options?.headers,
          };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.statusText}`;

        // 403 エラーの場合は、より具体的なメッセージを表示
        if (response.status === 403) {
          errorMessage = 'API キーが無効です。有効な API キーを取得してください。';
        }

        throw new EternalReturnAPIError(
          response.status,
          errorMessage
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof EternalReturnAPIError) {
        throw error;
      }
      throw new Error(`Failed to fetch from Eternal Return API: ${error}`);
    }
  }

  // キャラクター一覧を取得
  async getCharacters(): Promise<ERCharacter[]> {
    const response = await this.fetch<ERApiResponse<ERCharacter[]>>('/v1/data/Character');
    return response.data;
  }

  // 特定のキャラクター情報を取得
  async getCharacter(characterCode: number): Promise<ERCharacter> {
    const response = await this.fetch<ERApiResponse<ERCharacter>>(`/v1/data/Character/${characterCode}`);
    return response.data;
  }

  // ゲームバージョン情報を取得
  async getGameVersion(): Promise<string> {
    const response = await this.fetch<ERApiResponse<Record<string, number>>>('/v1/data/hash');
    // ハッシュデータから最新のゲームバージョンを推定
    // 実際のバージョン番号ではなく、データハッシュを返す
    const hashValues = Object.values(response.data);
    if (hashValues.length > 0) {
      return `Data Hash: ${hashValues[0]}`;
    }
    return 'Unknown';
  }

  // APIキーの有効性をチェック
  async checkAPIKey(): Promise<boolean> {
    try {
      await this.getGameVersion();
      return true;
    } catch (error) {
      if (error instanceof EternalReturnAPIError && error.code === 401) {
        return false;
      }
      throw error;
    }
  }
}

// シングルトンインスタンス
const eternalReturnAPI = new EternalReturnAPI();

export default eternalReturnAPI;

// 型のエクスポート
export type { ERCharacter, ERApiResponse };
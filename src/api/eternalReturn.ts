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
  // ステータス
  maxHp: number;
  maxSp: number;
  attackPower: number;
  defense: number;
  attackSpeed: number;
  moveSpeed: number;
  hpRegen: number;
  spRegen: number;
  criticalStrikeChance?: number;
  attackSpeedLimit?: number;
  // 追加のフィールドは必要に応じて追加
}

interface ERCharacterLevelUpStat {
  code: number;
  name: string;
  maxHp: number;
  maxSp: number;
  attackPower: number;
  defense: number;
  skillAmp: number;
  adaptiveForce: number;
  criticalChance: number;
  hpRegen: number;
  spRegen: number;
  attackSpeed: number;
  moveSpeed: number;
}

interface ERApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface ERLocalizationResponse {
  l10Path: string;
}

interface ERCharacterMastery {
  code: number;
  weapon1: string;
  weapon2: string;
  weapon3: string;
  weapon4: string;
  exploration1: string;
  exploration2: string;
  exploration3: string;
  exploration4: string;
  survival1: string;
  survival2: string;
  survival3: string;
  survival4: string;
}

interface ERMasteryStat {
  code: number;
  type: string;
  characterCode: number;
  option1: string;
  optionValue1: number;
  option2: string;
  optionValue2: number;
  option3: string;
  optionValue3: number;
}

interface ERItemWeapon {
  code: number;
  name: string;
  itemType: string;
  weaponType: string;
  itemGrade: string;
  stackable: number;
  initialCount: number;
  consumable: boolean;
  exclusive: boolean;
  sellCost: number;
  attackPower?: number;
  defense?: number;
  skillAmp?: number;
  adaptiveForce?: number;
  attackSpeed?: number;
  criticalStrikeChance?: number;
  cooldownReduction?: number;
  hpRegen?: number;
  spRegen?: number;
  moveSpeed?: number;
  sightRange?: number;
  attackRange?: number;
  increaseBasicAttackDamage?: number;
  preventBasicAttackDamaged?: number;
  preventSkillDamagedRatio?: number;
}

interface ERWeaponTypeInfo {
  code: string;
  subTypeCode?: string;
  attackType: string;
  rangeType: string;
  learningTime: number;
  attackPower: number;
  attackSpeed: number;
  weaponLength: number;
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
    const response = await this.fetch<ERApiResponse<ERCharacter[]>>('/v2/data/Character');
    return response.data;
  }

  // 特定のキャラクター情報を取得
  async getCharacter(characterCode: number): Promise<ERCharacter> {
    const response = await this.fetch<ERApiResponse<ERCharacter>>(`/v2/data/Character/${characterCode}`);
    return response.data;
  }

  // ゲームバージョン情報を取得
  async getGameVersion(): Promise<string> {
    const response = await this.fetch<ERApiResponse<Record<string, number>>>('/v2/data/hash');
    // ハッシュデータから最新のゲームバージョンを推定
    // 実際のバージョン番号ではなく、データハッシュを返す
    const hashValues = Object.values(response.data);
    if (hashValues.length > 0) {
      return `Data Hash: ${hashValues[0]}`;
    }
    return 'Unknown';
  }

  // キャラクターレベルアップステータスを取得
  async getCharacterLevelUpStats(): Promise<ERCharacterLevelUpStat[]> {
    const response = await this.fetch<ERApiResponse<ERCharacterLevelUpStat[]>>('/v2/data/CharacterLevelUpStat');
    return response.data;
  }

  // キャラクター熟練度情報を取得
  async getCharacterMastery(): Promise<ERCharacterMastery[]> {
    const response = await this.fetch<ERApiResponse<ERCharacterMastery[]>>('/v2/data/CharacterMastery');
    return response.data;
  }

  // 熟練度ステータスボーナスを取得
  async getMasteryStat(): Promise<ERMasteryStat[]> {
    const response = await this.fetch<ERApiResponse<ERMasteryStat[]>>('/v2/data/MasteryStat');
    return response.data;
  }

  // ローカライゼーションファイルのURLを取得
  async getLocalizationPath(language: 'Korean' | 'Japanese' | 'English'): Promise<string> {
    console.log(`Getting localization path for ${language}`);

    // v1エンドポイントを最初に試す（v1の方が安定している）
    try {
      const response = await this.fetch<ERApiResponse<ERLocalizationResponse>>(`/v1/l10n/${language}`);
      console.log(`V1 Localization response for ${language}:`, response);
      if (response.data && response.data.l10Path) {
        return response.data.l10Path;
      }
    } catch {
      console.log(`V1 failed for ${language}, trying V2`);
    }

    // v2エンドポイントを試す
    try {
      const response = await this.fetch<ERApiResponse<ERLocalizationResponse>>(`/v2/l10n/${language}`);
      console.log(`V2 Localization response for ${language}:`, response);
      if (response.data && response.data.l10Path) {
        return response.data.l10Path;
      }
    } catch {
      console.log(`V2 also failed for ${language}`);
    }

    // APIキーをクエリパラメータとして試す
    console.log(`Trying with API key in query parameter for ${language}`);
    const apiKey = import.meta.env.VITE_ETERNAL_RETURN_API_KEY;
    if (apiKey) {
      // v1エンドポイントでAPIキーを試す
      try {
        const response = await fetch(`${API_BASE_URL}/v1/l10n/${language}?api_key=${apiKey}`, {
          headers: { 'accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.l10Path) {
            console.log(`Success with v1 + API key for ${language}`);
            return data.data.l10Path;
          }
        }
      } catch (error) {
        console.error(`Failed with API key for ${language}:`, error);
      }
    }

    throw new Error(`Failed to get localization path for ${language}`);
  }

  // ローカライゼーションデータを取得してパース
  async getLocalizationData(language: 'Korean' | 'Japanese' | 'English'): Promise<Map<string, string>> {
    try {
      console.log(`Fetching localization data for ${language}`);

      let url: string;

      try {
        // まずAPIから正しいパスを取得
        const l10Path = await this.getLocalizationPath(language);
        console.log(`Got localization path for ${language}:`, l10Path);
        url = import.meta.env.DEV
          ? l10Path.replace('https://d1wkxvul68bth9.cloudfront.net', '/api')
          : l10Path;
      } catch {
        console.warn(`Failed to get localization path from API for ${language}, using fallback`);
        // フォールバック: 既知のURL（複数のパターンを試す）
        const knownPaths: Record<string, string[]> = {
          'Japanese': ['/api/l10n/l10n-Japanese-20251114072917.txt'],
          'Korean': [
            '/api/l10n/l10n-Korean-20251114072644.txt', // v1 API から取得した正しいタイムスタンプ
            '/api/l10n/l10n-Korean-20251114072917.txt',
            '/api/l10n/l10n-Korean-20241114072917.txt',
            '/api/l10n/l10n-Korean-20241113072917.txt',
            '/api/l10n/l10n-Korean-Latest.txt'
          ],
          'English': ['/api/l10n/l10n-English-20251114072917.txt']
        };
        const paths = knownPaths[language];
        if (!paths || paths.length === 0) {
          throw new Error(`No known paths for ${language} localization`);
        }
        // 最初の利用可能なパスを使用
        url = paths[0];
      }

      console.log(`Fetching from URL:`, url);

      // UTF-8でテキストを取得
      let response = await fetch(url, {
        headers: {
          'Accept-Charset': 'utf-8'
        }
      });

      console.log(`Response status for ${language}: ${response.status}`);

      // 403エラーの場合、APIキーをクエリパラメータとして試す
      if (response.status === 403) {
        const apiKey = import.meta.env.VITE_ETERNAL_RETURN_API_KEY;
        if (apiKey) {
          console.log(`Retrying with API key in query parameter for ${language} localization file`);
          const urlWithKey = url.includes('?') ? `${url}&api_key=${apiKey}` : `${url}?api_key=${apiKey}`;
          response = await fetch(urlWithKey, {
            headers: {
              'Accept-Charset': 'utf-8'
            }
          });
          console.log(`Retry response status for ${language}: ${response.status}`);
        }
      }

      if (!response.ok) {
        console.error(`Failed to fetch ${language} localization: HTTP ${response.status}`);
        return new Map<string, string>();
      }

      // ArrayBufferとして取得し、TextDecoderでUTF-8デコード
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(buffer);

      // テキストをパース
      const locMap = new Map<string, string>();
      const lines = text.split('\n');
      console.log(`Parsing ${language} localization: ${lines.length} lines, text length: ${text.length}`);

      let parsedCount = 0;
      for (const line of lines) {
        if (!line.trim()) continue;

        // ┃ 記号で区切られているようなので、それで分割
        const parts = line.split('┃');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts[1].trim();
          locMap.set(key, value);
          parsedCount++;
        } else if (line.includes('\t')) {
          // タブ区切りの場合
          const [key, ...valueParts] = line.split('\t');
          if (key && valueParts.length > 0) {
            locMap.set(key.trim(), valueParts.join('\t').trim());
            parsedCount++;
          }
        }
      }

      console.log(`Parsed ${parsedCount} entries for ${language}. Map size: ${locMap.size}`);
      if (locMap.size > 0) {
        console.log(`Sample entries:`, Array.from(locMap.entries()).slice(0, 5));
      }

      return locMap;
    } catch (error) {
      console.error(`Failed to load ${language} localization:`, error);
      return new Map<string, string>();
    }
  }

  // 武器アイテム情報を取得
  async getItemWeapons(): Promise<ERItemWeapon[]> {
    const response = await this.fetch<ERApiResponse<ERItemWeapon[]>>('/v2/data/ItemWeapon');
    return response.data;
  }

  // 武器タイプ情報を取得
  async getWeaponTypeInfo(): Promise<ERWeaponTypeInfo[]> {
    const response = await this.fetch<ERApiResponse<ERWeaponTypeInfo[]>>('/v2/data/WeaponTypeInfo');
    return response.data;
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
export type { ERCharacter, ERCharacterLevelUpStat, ERCharacterMastery, ERMasteryStat, ERItemWeapon, ERWeaponTypeInfo, ERApiResponse };
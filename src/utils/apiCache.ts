// API キャッシュユーティリティ
// localStorage を使用して API レスポンスをキャッシュし、レート制限を回避

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private readonly CACHE_PREFIX = 'er_api_cache_';
  private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1時間（ミリ秒）

  // キャッシュにデータを保存
  set<T>(key: string, data: T, ttlMs: number = this.DEFAULT_TTL): void {
    // MapオブジェクトをArrayに変換してシリアライズ
    let serializedData: unknown = data;
    if (data instanceof Map) {
      serializedData = {
        _type: 'Map',
        _data: Array.from(data.entries())
      };
    }

    const cacheItem: CacheItem<unknown> = {
      data: serializedData,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs
    };

    try {
      localStorage.setItem(
        this.CACHE_PREFIX + key,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Failed to save to cache:', error);
      // ストレージが満杯の場合、古いキャッシュをクリア
      this.clearExpiredCache();
    }
  }

  // キャッシュからデータを取得
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!item) return null;

      const cacheItem: CacheItem<unknown> = JSON.parse(item);

      // 有効期限チェック
      if (Date.now() > cacheItem.expiresAt) {
        this.remove(key);
        return null;
      }

      // Mapオブジェクトを復元
      let data = cacheItem.data;
      if (data && data._type === 'Map' && Array.isArray(data._data)) {
        data = new Map(data._data);
      }

      return data as T;
    } catch (error) {
      console.error('Failed to read from cache:', error);
      return null;
    }
  }

  // 特定のキーのキャッシュを削除
  remove(key: string): void {
    localStorage.removeItem(this.CACHE_PREFIX + key);
  }

  // 期限切れのキャッシュをクリア
  clearExpiredCache(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const cacheItem: CacheItem<unknown> = JSON.parse(item);
            if (now > cacheItem.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // パースエラーの場合は削除
          localStorage.removeItem(key);
        }
      }
    });
  }

  // すべてのキャッシュをクリア
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  // キャッシュの統計情報を取得
  getStats(): { totalSize: number; itemCount: number } {
    let totalSize = 0;
    let itemCount = 0;

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
          itemCount++;
        }
      }
    });

    return { totalSize, itemCount };
  }
}

// シングルトンインスタンス
export const apiCache = new ApiCache();

// キャッシュ付き fetch ラッパー
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs?: number
): Promise<T> {
  // キャッシュから取得を試みる
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    console.log(`Cache hit for key: ${key}`);
    return cached;
  }

  // キャッシュミスの場合、APIから取得
  console.log(`Cache miss for key: ${key}, fetching from API...`);
  try {
    const data = await fetcher();
    // 成功したらキャッシュに保存
    apiCache.set(key, data, ttlMs);
    return data;
  } catch (error) {
    // エラーの場合でも、古いキャッシュがあれば返す（stale-while-revalidate戦略）
    const staleCache = apiCache.get<T>(key);
    if (staleCache !== null) {
      console.warn('Using stale cache due to API error:', error);
      return staleCache;
    }
    throw error;
  }
}
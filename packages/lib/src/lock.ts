interface Lock {
  lock(): boolean;
  unlock(): void;
  runWithLock<T>(func: () => T): T | null;
}

/**
 * createメソッドのオプション
 */
type CacheLockOptions = {
  /**
   * ロックキー
   * デフォルトは "lock"
   */
  lockKey?: string;
  /**
   * ロックの有効期限（秒）
   * デフォルトは 120秒
   */
  expirationInSeconds?: number;
};

/**
 * GASのキャッシュを利用した排他ロック
 */
class CacheLock implements Lock {
  /**
   * @param cache キャッシュ
   * @param lockKey ロックキー
   * @param expirationInSeconds ロックの有効期限（秒）
   */
  constructor(
    private cache: GoogleAppsScript.Cache.Cache,
    private lockKey: string,
    private expirationInSeconds: number,
  ) {
    //
  }

  /**
   * オプションからキャッシュロックを取得するfactoryメソッド
   *
   *
   * @param options
   * @returns
   */
  static create(options: CacheLockOptions = {}): CacheLock {
    const { lockKey = 'lock', expirationInSeconds = 120 } = options;
    return new CacheLock(
      CacheService.getScriptCache(),
      lockKey,
      expirationInSeconds,
    );
  }

  /**
   * ロックを取得する
   * 1. ロックが取得できた場合はtrueを返す
   * 2. 既にロックが取得されている場合はfalseを返す
   *
   * @returns
   */
  lock(): boolean {
    if (this.cache.get(this.lockKey)) {
      return false;
    }

    this.cache.put(this.lockKey, 'locked', this.expirationInSeconds);

    return true;
  }

  /**
   * ロックを解放する
   *
   * @returns
   */
  unlock(): void {
    if (this.cache.get(this.lockKey)) {
      this.cache.remove(this.lockKey);
    }
  }

  /**
   * ロックを取得して関数を実行する
   * 1. ロックが取得できた場合は関数を実行して結果を返す
   * 2. 既にロックが取得されている場合はnullを返す
   *
   * ロック中に他の処理が実行された場合はスキップされる
   *
   * @param func
   * @returns
   */
  runWithLock<T>(func: () => T): T | null {
    if (this.lock()) {
      try {
        return func();
      } finally {
        this.unlock();
      }
    }

    return null;
  }
}

export { type Lock, CacheLock };

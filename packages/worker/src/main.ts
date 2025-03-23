import {
  CacheLock,
  SpreadsheetQueue,
  deleteTriggersByName,
} from '@queue/gas-lib';
import { z } from 'zod';

/**
 * リクエストパラメータのスキーマ
 */
const parametersSchema = z.record(z.string());

/**
 * キューを定期的に処理するためのトリガーを追加する
 * キューを処理するにはこの関数を手動で実行する必要がある
 *
 * @returns void
 */
const addTrigger = () => {
  deleteTriggersByName('handleQueue');

  ScriptApp.newTrigger('handleQueue').timeBased().everyMinutes(1).create();
};

/**
 * キューを処理する
 *
 * @returns void
 */
const handleQueue = () => {
  // envファイルからスプレッドシートIDを取得してキューを作成
  const queue = SpreadsheetQueue.create<z.infer<typeof parametersSchema>>({
    spreadsheetId: process.env.QUEUE_SHEET_ID,
    parser: parametersSchema.parse,
  });

  // dequeue中に他の処理が実行されると多重に処理されるため排他ロックを取得
  const lock = CacheLock.create();

  // 排他ロックを取得してキューを処理する
  // ロック中に他の処理が実行された場合はスキップされる
  lock.runWithLock(() => {
    while (queue.isEmpty() === false) {
      const payload = queue.dequeue();

      if (payload === null) {
        continue;
      }

      Logger.log(payload);
    }
  });
};

// @ts-expect-error
global.addTrigger = addTrigger;
// @ts-expect-error
global.handleQueue = handleQueue;

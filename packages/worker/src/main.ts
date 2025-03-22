import { SpreadsheetQueue, deleteTriggersByName } from '@queue/gas-lib';
import { z } from 'zod';

/**
 * リクエストパラメータのスキーマ
 */
const parametersSchema = z.record(z.string());

/**
 * トリガーを追加する
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
  const queue = SpreadsheetQueue.open<z.infer<typeof parametersSchema>>({
    spreadsheetId: process.env.QUEUE_SHEET_ID,
  });

  while (queue.isEmpty() === false) {
    const payload = queue.dequeue(parametersSchema.parse);

    if (payload === null) {
      continue;
    }

    Logger.log(payload);
  }
};

// @ts-expect-error
global.addTrigger = addTrigger;
// @ts-expect-error
global.handleQueue = handleQueue;

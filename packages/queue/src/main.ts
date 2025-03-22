import { SpreadsheetQueue } from '@queue/gas-lib';

const doPost = (
  e: GoogleAppsScript.Events.DoPost,
): GoogleAppsScript.Content.TextOutput => {
  // オプションを指定しない場合はGASのアクティブなスプレッドシートを利用する
  const queue = SpreadsheetQueue.create();

  // リクエストパラメータをキューに追加する
  queue.enqueue(e.parameter);

  return ContentService.createTextOutput('キューを追加しました！');
};

// @ts-expect-error
global.doPost = doPost;

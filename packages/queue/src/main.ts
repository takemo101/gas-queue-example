import { SpreadsheetQueue } from '@queue/gas-lib';

const doPost = (
  e: GoogleAppsScript.Events.DoPost,
): GoogleAppsScript.Content.TextOutput => {
  const queue = SpreadsheetQueue.open();

  queue.enqueue(e.parameter);

  return ContentService.createTextOutput('キューを追加しました！');
};

// @ts-expect-error
global.doPost = doPost;

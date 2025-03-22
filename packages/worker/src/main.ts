import { SpreadsheetQueue, deleteTriggersByName } from '@queue/gas-lib';

const addTrigger = () => {
  deleteTriggersByName('handleQueue');

  ScriptApp.newTrigger('handleQueue').timeBased().everyMinutes(1).create();
};

const handleQueue = () => {
  const queue = SpreadsheetQueue.open({
    sheetId: process.env.QUEUE_SHEET_ID,
  });

  while (queue.isEmpty() === false) {
    const payload = queue.dequeue();

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

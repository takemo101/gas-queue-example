type DequeueParser<T> = (data: unknown) => T;

interface Queue<T> {
  enqueue(data: T): void;
  dequeue(parser?: DequeueParser<T>): T | null;
  isEmpty(): boolean;
  size(): number;
}

type SpreadsheetQueueOptions = {
  sheetId?: string;
  sheetName?: string;
};

type DefaultQueueData = {
  [key: string]: string;
};

class SpreadsheetQueue<T = DefaultQueueData> implements Queue<T> {
  constructor(private _sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    //
  }

  /**
   * スプレッドシートを開いてキューを取得します
   *
   * @param spreadsheetId
   * @returns
   */
  static open<T = DefaultQueueData>(
    options: SpreadsheetQueueOptions = {},
  ): Queue<T> {
    const { sheetId, sheetName } = options;

    // シートIDが指定されている場合は指定されたスプレッドシートを開く
    const spreadsheet = sheetId
      ? SpreadsheetApp.openById(sheetId)
      : SpreadsheetApp.getActiveSpreadsheet();

    const sheet = sheetName
      ? spreadsheet.getSheetByName(sheetName)
      : spreadsheet.getActiveSheet();

    if (!sheet) {
      throw new Error(`${sheetName}シートが見つかりませんでした`);
    }

    return new SpreadsheetQueue(sheet);
  }

  /**
   * キューにデータを追加します
   *
   * @param data
   * @returns
   */
  enqueue(data: T): void {
    const dataString = JSON.stringify(data);

    this._sheet.appendRow([dataString, new Date().toISOString()]);
  }

  /**
   * キューの先頭データを取得します
   *
   * @param parser
   * @returns
   */
  dequeue(parser?: DequeueParser<T>): T | null {
    const range = this._sheet.getRange(1, 1);
    const dataString = range.getValue();

    if (!dataString) {
      return null;
    }

    const parsedData = JSON.parse(dataString as string);

    // パーサーが指定されている場合はパースして返す
    const data = parser ? parser(parsedData) : (parsedData as T);

    this._sheet.deleteRow(1);

    return data;
  }

  /**
   * キューが空かどうかを判定します
   *
   * @returns
   */
  isEmpty(): boolean {
    const range = this._sheet.getRange(1, 1);
    return range.isBlank();
  }

  /**
   * キューのサイズを取得します
   *
   * @returns
   */
  size(): number {
    const lastRow = this._sheet.getLastRow();

    if (this.isEmpty()) {
      return 0;
    }

    return lastRow;
  }
}

export { SpreadsheetQueue };

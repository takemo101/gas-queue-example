type DequeueParser<T> = (data: unknown) => T;

interface Queue<T> {
  enqueue(data: T): void;
  dequeue(): T | null;
  isEmpty(): boolean;
  size(): number;
}

/**
 * openメソッドのスプレッドシートオプション
 */
type SpreadsheetQueueOptions<T = DefaultQueueData> = {
  /**
   * キューとして利用しているスプレッドシートID
   * デフォルトはアクティブなスプレッドシート
   */
  spreadsheetId?: string;
  /**
   * キューとして利用しているシート名
   * デフォルトはアクティブなシート
   */
  sheetName?: string;
  /**
   * デキュー時にデータをパースする関数
   */
  parser?: DequeueParser<T>;
};

type DefaultQueueData = {
  [key: string]: string;
};

/**
 * スプレッドシートを利用したキュー
 */
class SpreadsheetQueue<T = DefaultQueueData> implements Queue<T> {
  constructor(
    private sheet: GoogleAppsScript.Spreadsheet.Sheet,
    private parser?: DequeueParser<T>,
  ) {
    //
  }

  /**
   * オプションからスプレッドシートを開いてキューを取得するfactoryメソッド
   *
   * @param options
   * @returns
   */
  static create<T = DefaultQueueData>(
    options: SpreadsheetQueueOptions<T> = {},
  ): Queue<T> {
    const { spreadsheetId, sheetName } = options;

    // シートIDが指定されている場合は指定されたスプレッドシートを開く
    const spreadsheet = spreadsheetId
      ? SpreadsheetApp.openById(spreadsheetId)
      : SpreadsheetApp.getActiveSpreadsheet();

    // シート名が指定されている場合は指定されたシートを取得する
    const sheet = sheetName
      ? spreadsheet.getSheetByName(sheetName)
      : spreadsheet.getActiveSheet();

    if (!sheet) {
      throw new Error(`${sheetName}シートが見つかりませんでした`);
    }

    return new SpreadsheetQueue(
      sheet,
      options.parser as DequeueParser<T> | undefined,
    );
  }

  /**
   * キューにデータを追加します
   *
   * @param data
   * @returns
   */
  enqueue(data: T): void {
    const dataString = JSON.stringify(data);

    this.sheet.appendRow([dataString, new Date().toISOString()]);
  }

  /**
   * キューの先頭データを取得します
   *
   * @returns
   */
  dequeue(): T | null {
    const range = this.sheet.getRange(1, 1);
    const dataString = range.getValue();
    const parser = this.parser;

    if (!dataString) {
      return null;
    }

    const parsedData = JSON.parse(dataString as string);

    // パーサーが指定されている場合はパースして返す
    const data = parser ? parser(parsedData) : (parsedData as T);

    this.sheet.deleteRow(1);

    return data;
  }

  /**
   * キューが空かどうかを判定します
   *
   * @returns
   */
  isEmpty(): boolean {
    const range = this.sheet.getRange(1, 1);
    return range.isBlank();
  }

  /**
   * キューのサイズを取得します
   *
   * @returns
   */
  size(): number {
    const lastRow = this.sheet.getLastRow();

    if (this.isEmpty()) {
      return 0;
    }

    return lastRow;
  }
}

export { type Queue, SpreadsheetQueue };

import { CSVTradeData, Trade, ImportResult, CSVSummary } from '../types/Trade';
import { v4 as uuidv4 } from 'uuid';
import * as Encoding from 'encoding-japanese';

// 文字列を数値に変換（カンマと正負記号に対応）
function parseNumber(value: string): number {
  if (!value) return 0;
  
  // 正負記号の処理は下記のcleanedValueで考慮される
  
  // カンマと正負記号を除去して数値に変換
  const cleanedValue = value.replace(/[,+]/g, '');
  const number = parseFloat(cleanedValue);
  
  return isNaN(number) ? 0 : number;
}

// 日付文字列をDateオブジェクトに変換
function parseDate(dateStr: string): Date {
  // "2025/7/28" 形式の日付をパース
  const [year, month, day] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

// 銘柄名から銘柄コードと純粋な銘柄名を抽出
function extractStockInfo(stockNameWithCode: string): { name: string; code?: string } {
  // 日本株のティッカーコードパターン:
  // - 標準: 4桁数字 (1234, 7203)
  // - 優先株: 4桁数字+アルファベット1文字 (1234A, 5678B)
  // - 特殊銘柄: 3桁数字+アルファベット1文字 (123A, 456B)
  // - 一部のETF/REIT等: その他の英数字組み合わせ
  
  // パターン1: 末尾の証券コードを抽出
  const match = stockNameWithCode.match(/^(.+?)\s+([0-9]{3,4}[A-Z]?|[0-9A-Z]{3,5})$/);
  if (match) {
    const code = match[2];
    // 有効な証券コードパターンかチェック
    if (/^(\d{4}[A-Z]?|\d{3}[A-Z]|[0-9A-Z]{3,5})$/.test(code)) {
      return {
        name: match[1].trim(),
        code: code
      };
    }
  }
  
  // パターン2: コードが含まれていない場合
  return {
    name: stockNameWithCode.trim(),
    code: undefined
  };
}

// CSVの行をTradeオブジェクトに変換
function parseTradeRow(row: string[], headers: string[]): CSVTradeData | null {
  if (row.length < headers.length) return null;

  const data: Record<string, string> = {};
  headers.forEach((header, index) => {
    data[header] = row[index];
  });

  try {
    return {
      約定日: data['約定日'],
      口座: data['口座'] as CSVTradeData['口座'],
      銘柄名: data['銘柄名'],
      取引: data['取引'] as CSVTradeData['取引'],
      数量: parseNumber(data['数量']),
      売却決済額: parseNumber(data['売却/決済額']),
      単価: parseNumber(data['単価']),
      平均取得価額: parseNumber(data['平均取得価額']),
      実現損益: parseNumber(data['実現損益(税引前・円)']),
    };
  } catch (error) {
    console.error('行のパースエラー:', error, row);
    return null;
  }
}

// CSVデータをTradeオブジェクトに変換
function csvTradeToTrade(csvTrade: CSVTradeData): Trade {
  const now = new Date();
  const stockInfo = extractStockInfo(csvTrade.銘柄名);
  
  return {
    id: uuidv4(),
    date: parseDate(csvTrade.約定日),
    accountType: csvTrade.口座,
    stockName: stockInfo.name,  // 純粋な銘柄名のみを保存
    stockCode: stockInfo.code,   // 銘柄コードを別フィールドに保存
    tradeType: csvTrade.取引,
    quantity: csvTrade.数量,
    amount: csvTrade.売却決済額,
    unitPrice: csvTrade.単価,
    averageAcquisitionPrice: csvTrade.平均取得価額,
    realizedProfitLoss: csvTrade.実現損益,
    csvImported: true,
    createdAt: now,
    updatedAt: now,
  };
}

// CSVサマリー情報を抽出
function extractSummary(lines: string[]): CSVSummary | null {
  try {
    // サマリー部分を探す
    let summaryStartIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('検索件数')) {
        summaryStartIndex = i;
        break;
      }
    }

    if (summaryStartIndex === -1) return null;

    // サマリー情報を抽出
    const summaryData: Record<string, string> = {};
    
    // 検索件数、約定日、種類、口座を抽出
    for (let i = summaryStartIndex; i < Math.min(summaryStartIndex + 10, lines.length); i++) {
      const parts = lines[i].split(',').map(s => s.replace(/"/g, ''));
      if (parts.length >= 2) {
        summaryData[parts[0]] = parts[1];
      }
    }

    // 商品別損益を探す
    const productProfitData = [];
    let productStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('商品') && lines[i].includes('実現損益')) {
        productStartIndex = i + 1;
        break;
      }
    }

    if (productStartIndex > -1) {
      for (let i = productStartIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.replace(/"/g, ''));
        if (parts[0] === '現物' || parts[0] === '信用') {
          productProfitData.push({
            商品: parts[0] as '現物' | '信用',
            実現損益: parseNumber(parts[1]),
            利益金額: parseNumber(parts[2]),
            損失金額: parseNumber(parts[3]),
          });
        } else if (parts[0] === '合計') {
          break;
        }
      }
    }

    return {
      検索件数: parseInt(summaryData['検索件数'] || '0'),
      約定日: summaryData['約定日'] || '',
      種類: summaryData['種類'] || '',
      口座: summaryData['口座'] || '',
      商品別損益: productProfitData,
    };
  } catch (error) {
    console.error('サマリー抽出エラー:', error);
    return null;
  }
}

// CSVを行に分割し、ダブルクォート内のカンマを処理
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    result.push(current.trim());
  }
  
  return result.map(cell => cell.replace(/^"|"$/g, '')); // 前後のダブルクォートを除去
}

// CSVファイルをパース
export async function parseCSV(content: string): Promise<{
  trades: Trade[];
  summary: CSVSummary | null;
  result: ImportResult;
}> {
  const lines = content.split('\n').filter(line => line.trim());
  const trades: Trade[] = [];
  const errors: string[] = [];
  
  // サマリー情報を抽出
  const summary = extractSummary(lines);
  
  // 取引データのヘッダーを探す
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('約定日') && lines[i].includes('銘柄名') && lines[i].includes('取引')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    return {
      trades: [],
      summary,
      result: {
        success: false,
        totalRecords: 0,
        importedRecords: 0,
        rejectedRecords: 0,
        errors: ['CSVフォーマットが正しくありません。取引データのヘッダーが見つかりません。'],
      },
    };
  }

  // ヘッダーを解析
  const headers = parseCSVLine(lines[headerIndex]);
  
  // データ行を処理
  let totalRecords = 0;
  let importedRecords = 0;
  let rejectedRecords = 0;

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSVの各行をパース
    const row = parseCSVLine(line);
    
    // 空行や合計行をスキップ
    if (row.length < 2 || row[0] === '' || row[0] === '合計') continue;
    
    totalRecords++;
    
    const csvTrade = parseTradeRow(row, headers);
    if (csvTrade) {
      try {
        const trade = csvTradeToTrade(csvTrade);
        trades.push(trade);
        importedRecords++;
      } catch (error) {
        rejectedRecords++;
        errors.push(`行 ${i + 1}: ${error instanceof Error ? error.message : '変換エラー'}`);
      }
    } else {
      rejectedRecords++;
      errors.push(`行 ${i + 1}: データの解析に失敗しました`);
    }
  }


  return {
    trades,
    summary,
    result: {
      success: importedRecords > 0,
      totalRecords,
      importedRecords,
      rejectedRecords,
      errors,
    },
  };
}

// ファイルを読み込んでテキストを返す（encoding-japaneseライブラリ使用）
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(buffer);
        
        // encoding-japaneseライブラリを使用してShift-JISをUnicodeに変換
        const unicodeArray = Encoding.convert(uint8Array, {
          to: 'UNICODE',
          from: 'SJIS'
        });
        
        // Unicodeの配列を文字列に変換
        const text = Encoding.codeToString(unicodeArray);
        
        resolve(text);
      } catch {
        // Shift-JISで失敗した場合はUTF-8として再試行
        const reader2 = new FileReader();
        reader2.onload = (e2) => {
          resolve(e2.target?.result as string);
        };
        reader2.onerror = () => {
          reject(new Error('ファイルの読み込みに失敗しました'));
        };
        reader2.readAsText(file, 'utf-8');
      }
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    // ArrayBufferとして読み込んでからencoding-japaneseで処理
    reader.readAsArrayBuffer(file);
  });
}
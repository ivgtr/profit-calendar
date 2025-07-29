import { CSVTradeData, Trade, ImportResult, CSVSummary } from '../types/Trade';
import { v4 as uuidv4 } from 'uuid';

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

// 銘柄名から銘柄コードを抽出
function extractStockCode(stockName: string): string | undefined {
  const match = stockName.match(/\s(\d{4})$/);
  return match ? match[1] : undefined;
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
  const stockCode = extractStockCode(csvTrade.銘柄名);
  
  return {
    id: uuidv4(),
    date: parseDate(csvTrade.約定日),
    accountType: csvTrade.口座,
    stockName: csvTrade.銘柄名,
    stockCode,
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

// ファイルを読み込んでテキストを返す
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => {
      reject(new Error('ファイルの読み込みに失敗しました'));
    };
    
    // Shift-JISとして読み込む
    reader.readAsText(file, 'Shift-JIS');
  });
}
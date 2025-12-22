import * as XLSX from 'xlsx';
import { ParseResult, CsvParseOptions } from './types';
import { parseTabularData } from './parseTabularData';

export function parseCSV(
  fileBuffer: Buffer | ArrayBuffer,
  options: CsvParseOptions
): ParseResult {
  const {
    delimiter = ',',
    encoding = 'utf-8',
  } = options;

  /* 1. CSV 읽기 */
  const workbook = XLSX.read(fileBuffer, {
    type: fileBuffer instanceof ArrayBuffer ? 'array' : 'buffer',
    raw: true,
    codepage: encoding === 'utf-8' ? 65001 : undefined,
    FS: delimiter,
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet || !worksheet['!ref']) {
    return { originHeaderNames: [], fields: [], header: {}, body: [] };
  }

  /* 2. Sheet → 2차원 배열 */
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    range: worksheet['!ref'],
    raw: true,
    defval: '',
  });

  /* 3. parseTabularData를 사용하여 파싱 */
  return parseTabularData(rows, options);
}

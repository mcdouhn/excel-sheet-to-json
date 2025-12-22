import * as XLSX from 'xlsx';
import { ParseResult, CsvParseOptions } from './types';

export function parseCSV(
  fileBuffer: Buffer | ArrayBuffer,
  options: CsvParseOptions
): ParseResult {
  const {
    delimiter = ',',
    encoding = 'utf-8',
    headerStartRowNumber,
    bodyStartRowNumber,
    headerNameToKey,
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

  if (rows.length === 0) {
    return { originHeaderNames: [], fields: [], header: {}, body: [] };
  }

  /* 3. 인덱스 계산 (1-based → 0-based) */
  const headerRowIndex = headerStartRowNumber - 1;
  const bodyRowIndex = bodyStartRowNumber - 1;

  /* 4. 원본 헤더 추출 + trim */
  const rawHeaders: string[] = (rows[headerRowIndex] || []).map(h =>
    String(h).trim()
  );

  const originHeaderNames = rawHeaders.filter(h => h !== '');

  /* 5. 헤더 인덱스 맵 (🔥 성능 핵심) */
  const headerIndexMap: Record<string, number> = {};
  rawHeaders.forEach((name, index) => {
    if (name) headerIndexMap[name] = index;
  });

  /* 6. fields / header 매핑 */
  const fields: string[] = [];
  const header: Record<string, string> = {};

  originHeaderNames.forEach(originName => {
    const key = headerNameToKey[originName];
    if (key) {
      fields.push(key);
      header[key] = originName;
    }
  });

  /* 7. 바디 파싱 */
  const body: any[] = [];

  for (let i = bodyRowIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const record: Record<string, any> = {};
    let isEmptyRow = true;

    for (const key of fields) {
      const originName = header[key];
      const colIndex = headerIndexMap[originName];

      if (colIndex === undefined) continue;

      const cellValue = row[colIndex];
      const trimmed = String(cellValue ?? '').trim();

      if (trimmed !== '') isEmptyRow = false;

      // 숫자 자동 캐스팅
      if (trimmed !== '' && !isNaN(Number(trimmed))) {
        record[key] = Number(trimmed);
      } else {
        record[key] = trimmed;
      }
    }

    if (!isEmptyRow) {
      body.push(record);
    }
  }

  /* 8. 결과 반환 */
  return {
    originHeaderNames,
    fields,
    header,
    body,
  };
}

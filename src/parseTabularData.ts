import { ParseResult, ParseOptions } from './types';

export function parseTabularData(
  rows: any[][],
  options: ParseOptions
): ParseResult {
  const {
    headerStartRowNumber,
    bodyStartRowNumber,
    headerNameToKey,
    castNumber = true,
  } = options;

  if (!rows || rows.length === 0) {
    return { originHeaderNames: [], fields: [], header: {}, body: [] };
  }

  const headerRowIndex = headerStartRowNumber - 1;
  const bodyRowIndex = bodyStartRowNumber - 1;

  /* 1. 헤더 추출 */
  const rawHeaders: string[] = (rows[headerRowIndex] || []).map(h =>
    String(h ?? '').trim()
  );

  const originHeaderNames = rawHeaders.filter(Boolean);

  /* 2. 헤더 인덱스 맵 (🔥 성능 핵심) */
  const headerIndexMap: Record<string, number> = {};
  rawHeaders.forEach((name, index) => {
    if (name) headerIndexMap[name] = index;
  });

  /* 3. 매핑 필드 구성 */
  const fields: string[] = [];
  const header: Record<string, string> = {};

  originHeaderNames.forEach(originName => {
    const key = headerNameToKey[originName];
    if (key) {
      fields.push(key);
      header[key] = originName;
    }
  });

  /* 4. 바디 파싱 */
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

      const rawValue = row[colIndex];
      const trimmed = String(rawValue ?? '').trim();

      if (trimmed !== '') isEmptyRow = false;

      if (castNumber && trimmed !== '' && !isNaN(Number(trimmed))) {
        record[key] = Number(trimmed);
      } else {
        record[key] = trimmed;
      }
    }

    if (!isEmptyRow) {
      body.push(record);
    }
  }

  return {
    originHeaderNames,
    fields,
    header,
    body,
  };
}

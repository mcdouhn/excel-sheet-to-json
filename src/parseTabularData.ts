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

  const headerRowIndex = headerStartRowNumber ? headerStartRowNumber - 1 : 0;
  const bodyRowIndex = bodyStartRowNumber ? bodyStartRowNumber - 1 : 1;

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

  // originHeaderNames를 Set으로 변환하여 빠른 검색
  const originHeaderSet = new Set(originHeaderNames);

  /* 3. 매핑 필드 구성 (headerNameToKey의 정의 순서 우선) */
  const fields: string[] = [];
  const header: Record<string, string> = {};

  // headerNameToKey의 순서대로 순회 (ES2015+에서 객체 키 순서 보장)
  Object.entries(headerNameToKey).forEach(([originName, key]) => {
    // 실제 파일에 해당 헤더가 존재하는 경우에만 추가
    if (originHeaderSet.has(originName)) {
      fields.push(key);
      header[key] = originName;
    }
  });

  /* 4. 바디 파싱 (헤더 순서 보장) */
  const body: any[] = [];

  for (let i = bodyRowIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // 순서를 보장하기 위해 빈 객체 생성 후 fields 순서대로 속성 추가
    const record: Record<string, any> = {};
    let isEmptyRow = true;

    // fields 순서대로 속성을 추가하여 순서 보장
    for (const key of fields) {
      const originName = header[key];
      const colIndex = headerIndexMap[originName];
      if (colIndex === undefined) {
        record[key] = ''; // 헤더는 있지만 데이터가 없는 경우 빈 문자열
        continue;
      }

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

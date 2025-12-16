import { ParseResult, CsvParseOptions } from './types';

/**
 * CSV 파일을 파싱하여 JSON 구조로 변환합니다.
 * @param fileBuffer - CSV 파일의 Buffer 또는 ArrayBuffer
 * @param options - CSV 파싱 옵션
 * @returns ParseResult - 파싱된 결과
 */
export function parseCSV(
  fileBuffer: Buffer | ArrayBuffer,
  options: CsvParseOptions
): ParseResult {
  // 1. Buffer로 변환 (ArrayBuffer인 경우)
  let buffer: Buffer;
  if (fileBuffer instanceof ArrayBuffer) {
    buffer = Buffer.from(fileBuffer);
  } else {
    buffer = fileBuffer;
  }

  // 2. 기본 옵션 설정
  const delimiter = options.delimiter || ',';
  const encoding = options.encoding || 'utf-8';

  // 3. CSV 문자열로 변환
  const csvText = buffer.toString(encoding);

  // 4. 줄 단위로 분리 (CRLF, LF 모두 처리)
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length === 0) {
    return { originHeaderNames: [], fields: [], header: {}, body: [] };
  }

  // 5. CSV 파싱 함수 (간단한 구현 - 따옴표 처리 포함)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 이스케이프된 따옴표
          current += '"';
          i++;
        } else {
          // 따옴표 토글
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // 구분자 발견 (따옴표 밖)
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    // 마지막 필드 추가
    result.push(current.trim());
    return result;
  };

  // 6. 모든 줄 파싱
  const arrayData: string[][] = lines.map(line => parseCSVLine(line));

  // 7. 인덱스 계산 (1-based -> 0-based)
  const headerRowIndex = options.headerStartRowNumber - 1;
  const bodyRowIndex = options.bodyStartRowNumber - 1;

  // 8. 원본 헤더 추출
  const rawHeaders: string[] = arrayData[headerRowIndex] || [];
  const originHeaderNames: string[] = rawHeaders
    .map(name => (name ? String(name).trim() : ''))
    .filter(name => name !== '');

  // 9. fields 배열 및 header 객체 생성
  const fields: string[] = [];
  const header: { [key: string]: string } = {};

  originHeaderNames.forEach(originName => {
    const dbKey = options.headerNameToKey[originName];

    if (dbKey) {
      fields.push(dbKey);
      header[dbKey] = originName;
    }
  });

  // 10. 바디 데이터 변환
  const body = [];
  for (let i = bodyRowIndex; i < arrayData.length; i++) {
    const row = arrayData[i];
    const jsonObject: { [key: string]: any } = {};
    let isEmptyRow = true;

    for (const dbKey of fields) {
      const originName = header[dbKey];
      const colIndex = rawHeaders.findIndex(
        name => String(name).trim() === originName
      );

      if (colIndex !== -1 && colIndex < row.length) {
        const cellValue = row[colIndex] || '';

        if (
          cellValue !== null &&
          cellValue !== undefined &&
          String(cellValue).trim() !== ''
        ) {
          isEmptyRow = false;
        }

        // 숫자 변환 시도
        const trimmedValue = String(cellValue).trim();
        if (trimmedValue !== '' && !isNaN(Number(trimmedValue))) {
          jsonObject[dbKey] = Number(trimmedValue);
        } else {
          jsonObject[dbKey] = trimmedValue;
        }
      }
    }

    if (!isEmptyRow) {
      body.push(jsonObject);
    }
  }

  return {
    originHeaderNames: originHeaderNames,
    fields: fields,
    header: header,
    body: body,
  };
}

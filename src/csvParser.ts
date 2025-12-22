import * as XLSX from 'xlsx';
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
  // 1. 기본 옵션 설정
  const encoding = options.encoding || 'utf-8';
  
  // 2. xlsx 라이브러리로 CSV 파일 읽기 (브라우저/Node.js 모두 호환)
  const workbook = XLSX.read(fileBuffer, {
    type: fileBuffer instanceof ArrayBuffer ? 'array' : 'buffer',
    raw: true,
    codepage: encoding === 'utf-8' ? 65001 : undefined, // UTF-8 codepage
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // 2. 빈 행 생략 문제 해결: range 옵션 사용
  const sheetRef = worksheet['!ref'];
  if (!sheetRef) {
    return { originHeaderNames: [], fields: [], header: {}, body: [] };
  }

  const arrayData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    range: sheetRef,
    raw: true,
  });

  if (arrayData.length === 0) {
    return { originHeaderNames: [], fields: [], header: {}, body: [] };
  }

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

import * as XLSX from 'xlsx';
import { ParseResult, ParseOptions } from './types';

/**
 * Excel 파일을 파싱하여 JSON 구조로 변환합니다.
 * @param fileBuffer - Excel 파일의 Buffer 또는 ArrayBuffer
 * @param options - Excel 파싱 옵션
 * @returns ParseResult - 파싱된 결과
 */
export function parse(
  fileBuffer: any, // Buffer | ArrayBuffer (타입 추정)
  options: ParseOptions
): ParseResult {
  // 1. Buffer 읽기 및 워크북 생성
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
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

  // 3. 인덱스 계산 (1-based -> 0-based)
  const headerRowIndex = options.headerStartRowNumber - 1;
  const bodyRowIndex = options.bodyStartRowNumber - 1;

  // 4. 원본 헤더 추출
  const rawHeaders: string[] = arrayData[headerRowIndex] || [];

  const originHeaderNames: string[] = rawHeaders
    .map(name => (name ? String(name).trim() : ''))
    .filter(name => name !== '');

  // 5. fields 배열 및 header 객체 생성
  const fields: string[] = []; // 매핑 성공한 DB 키 목록 (순서 보존용)
  const header: { [key: string]: string } = {}; // { DB 키: 원본 헤더 이름 }

  originHeaderNames.forEach(originName => {
    const dbKey = options.headerNameToKey[originName];

    // 매핑 테이블에 존재하는 헤더만 처리
    if (dbKey) {
      fields.push(dbKey);
      header[dbKey] = originName;
    }
  });

  // 6. 바디 데이터 (JSON 배열) 변환
  const body = [];
  for (let i = bodyRowIndex; i < arrayData.length; i++) {
    const row = arrayData[i];
    const jsonObject: { [key: string]: any } = {};
    let isEmptyRow = true;

    let isRowDataValid = true;
    for (const dbKey of fields) {
      // 현재 DB 키에 매핑된 원본 헤더 이름
      const originName = header[dbKey];

      // 원본 헤더 이름이 arrayData[headerRowIndex]에서 몇 번째 인덱스(열)에 있는지 찾습니다.
      const colIndex = rawHeaders.findIndex(
        name => String(name).trim() === originName
      );

      if (colIndex !== -1) {
        const cellValue = row[colIndex] || '';

        if (
          cellValue !== null &&
          cellValue !== undefined &&
          String(cellValue).trim() !== ''
        ) {
          isEmptyRow = false;
        }

        jsonObject[dbKey] = cellValue;
      } else {
        // 이 필드는 헤더 행에 존재했지만, 어떤 이유로 찾을 수 없다면 오류로 간주할 수 있습니다.
        // 여기서는 매핑을 건너뛰고 다음 필드로 넘어갑니다.
        isRowDataValid = false;
      }
    }

    // 7. 모든 값이 빈 문자열이거나 null인 행은 건너뜁니다.
    if (!isEmptyRow && isRowDataValid) {
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

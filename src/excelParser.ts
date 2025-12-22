import * as XLSX from 'xlsx';
import { ParseResult, ParseOptions } from './types';
import { parseTabularData } from './parseTabularData';

/**
 * Excel 파일을 파싱하여 JSON 구조로 변환합니다.
 * @param fileBuffer - Excel 파일의 Buffer 또는 ArrayBuffer
 * @param options - Excel 파싱 옵션
 * @returns ParseResult - 파싱된 결과
 */
export function parse(
  fileBuffer: Buffer | ArrayBuffer,
  options: ParseOptions
): ParseResult {
  // 1. Buffer 읽기 및 워크북 생성
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

  // 2. 시트 이름 결정 (options.sheetName이 있으면 사용, 없으면 첫 번째 시트)
  let sheetName: string;
  if (options.sheetName) {
    if (!workbook.SheetNames.includes(options.sheetName)) {
      throw new Error(
        `Sheet "${
          options.sheetName
        }" not found. Available sheets: ${workbook.SheetNames.join(', ')}`
      );
    }
    sheetName = options.sheetName;
  } else {
    sheetName = workbook.SheetNames[0];
  }

  const worksheet = workbook.Sheets[sheetName];

  // 2. 빈 행 생략 문제 해결: range 옵션 사용
  const sheetRef = worksheet['!ref'];
  if (!sheetRef) {
    return { originHeaderNames: [], fields: [], header: {}, body: [] };
  }

  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    range: sheetRef,
    raw: true,
  });

  // 3. parseTabularData를 사용하여 파싱
  return parseTabularData(rows, options);
}

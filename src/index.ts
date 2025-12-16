import * as XLSX from 'xlsx';
// Buffer 타입은 Node.js 환경에서 사용되지만, TSDX 환경에서 전역적으로 접근 가능합니다.
// 브라우저에서는 ArrayBuffer가 사용됩니다.
export type FileData = Buffer | ArrayBuffer;

// 최종 출력 데이터 구조 정의
export interface ParseResult {
  originHeaderNames: string[];
  fields: string[];
  header: { [key: string]: string };
  body: any[];
}

export interface ParseOptions {
  headerStartRowNumber: number; // 1-based
  bodyStartRowNumber: number; // 1-based
  headerNameToKey: { [excelHeaderName: string]: string }; // {'제품 명칭': 'productName'}
}

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
    return { originHeaderNames: [], fields: [], header: {}, body: [] }; // 💡 header 초기값 변경
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

  // 💡 5. fields 배열 및 header 객체 생성 (수정된 로직)
  const fields: string[] = []; // 매핑 성공한 DB 키 목록 (순서 보존용)
  const header: { [key: string]: string } = {}; // { DB 키: 원본 헤더 이름 }

  originHeaderNames.forEach(originName => {
    const dbKey = options.headerNameToKey[originName];

    // 매핑 테이블에 존재하는 헤더만 처리
    if (dbKey) {
      fields.push(dbKey);
      header[dbKey] = originName; // 💡 DB 키를 Key로, 원본 헤더 이름을 Value로 저장
    }
  });

  // 6. 바디 데이터 (JSON 배열) 변환
  const body = [];
  for (let i = bodyRowIndex; i < arrayData.length; i++) {
    const row = arrayData[i];
    const jsonObject: { [key: string]: any } = {};
    let isEmptyRow = true;

    // 7. 각 열을 반복하며 JSON 객체 생성
    // 💡 arrayData의 모든 열을 반복하는 것이 아니라, fields 배열의 순서대로 반복해야 합니다.
    //    문제: 현재 fields 배열의 순서와 row[j]의 인덱스가 일치한다고 가정한 로직은
    //          매핑되지 않은 헤더가 중간에 있을 경우 깨질 수 있습니다.

    // 💡 해결책: 매핑 성공한 DB 키(fields) 순서대로 데이터를 찾아 할당합니다.

    // 이 문제를 해결하기 위해, arrayData[headerRowIndex]에서 DB 키에 해당하는
    // 원본 헤더의 인덱스를 찾아야 합니다.

    let isRowDataValid = true;
    for (const dbKey of fields) {
      // 현재 DB 키에 매핑된 원본 헤더 이름
      const originName = header[dbKey];

      // 원본 헤더 이름이 arrayData[headerRowIndex]에서 몇 번째 인덱스(열)에 있는지 찾습니다.
      // Array.prototype.indexOf를 사용하여 찾습니다.
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

    // 8. 모든 값이 빈 문자열이거나 null인 행은 건너뜁니다.
    // 💡 fields 배열을 기반으로 루프를 돌았으므로, row.length 대신 fields.length로 제어됩니다.
    if (!isEmptyRow && isRowDataValid) {
      body.push(jsonObject);
    }
  }

  return {
    originHeaderNames: originHeaderNames,
    fields: fields,
    header: header, // 💡 수정된 Key-Value 객체
    body: body,
  };
}

/**
 * 브라우저 환경에서의 File 객체를 ArrayBuffer로 변환합니다.
 * @param file - 브라우저 환경에서의 File 객체
 * @returns ArrayBuffer로 변환된 파일 데이터
 */
export function fileToArrayBufferInClient(file: File): Promise<ArrayBuffer> {
  // 파일이 유효한지 확인
  if (!file || !(file instanceof File)) {
    return Promise.reject(new Error('Input must be a valid File object.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // 1. 성공적으로 읽었을 때 처리
    reader.onload = event => {
      // event.target.result는 readAsArrayBuffer 호출 시 ArrayBuffer 타입입니다.
      const arrayBuffer = event.target?.result;
      if (arrayBuffer instanceof ArrayBuffer) {
        resolve(arrayBuffer);
      } else {
        reject(
          new Error('File reading completed, but result is not ArrayBuffer.')
        );
      }
    };

    // 2. 파일 읽기 실패 시 처리
    reader.onerror = error => {
      reject(error);
    };

    // 3. 파일 읽기 시작 (ArrayBuffer 형태로)
    reader.readAsArrayBuffer(file);
  });
}

export function arrayBufferToBufferInClient(arrayBuffer: ArrayBuffer): Buffer {
  return Buffer.from(arrayBuffer);
}

const ExcelSheetToJson = {
  parse,
  fileToArrayBufferInClient,
  arrayBufferToBufferInClient,
};

export default ExcelSheetToJson;

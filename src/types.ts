// 공통 타입 정의
export type FileData = Buffer | ArrayBuffer;

// 최종 출력 데이터 구조 정의
export interface ParseResult {
  originHeaderNames: string[];
  fields: string[];
  header: { [key: string]: string };
  body: any[];
}

// Excel 파싱 옵션
export interface ParseOptions {
  headerStartRowNumber: number; // 1-based
  bodyStartRowNumber: number; // 1-based
  headerNameToKey: { [excelHeaderName: string]: string }; // {'제품 명칭': 'productName'}
  castNumber?: boolean; // 숫자 변환 여부 (기본값: true)
}

// CSV 파싱 옵션
export interface CsvParseOptions {
  delimiter?: string; // CSV 구분자 (기본값: ',')
  encoding?: BufferEncoding; // 인코딩 (기본값: 'utf-8')
  headerStartRowNumber: number; // 1-based
  bodyStartRowNumber: number; // 1-based
  headerNameToKey: { [csvHeaderName: string]: string }; // {'제품 명칭': 'productName'}
  castNumber?: boolean; // 숫자 변환 여부 (기본값: true)
}

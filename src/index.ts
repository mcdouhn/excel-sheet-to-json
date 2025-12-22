// 타입 정의
export * from './types';

// Excel 파서
export { parse } from './excelParser';

// CSV 파서
export { parseCSV } from './csvParser';

// 파일 유틸리티
export {
  fileToArrayBufferInClient,
  arrayBufferToBufferInClient,
} from './fileUtils';

// 기본 export (하위 호환성)
import { parse } from './excelParser';
import { parseCSV } from './csvParser';
import {
  fileToArrayBufferInClient,
  arrayBufferToBufferInClient,
} from './fileUtils';

const ExcelSheetToJson = {
  parse,
  parseCSV,
  fileToArrayBufferInClient,
  arrayBufferToBufferInClient,
};

export default ExcelSheetToJson;

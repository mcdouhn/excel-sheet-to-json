// __tests__/index.test.ts
import * as path from 'path';
import * as fs from 'fs'; // Node.js 테스트 환경에서는 fs 사용 가능
import ExcelSheetToJson from '../src/index';

// 테스트 Excel 파일 경로 (예시: __tests__/test_data.xlsx)
const testFilePath = path.join(__dirname, 'test_data.csv');
let testFileBuffer: Buffer;

const testOptions = {
  headerStartRowNumber: 1, // Excel 2행부터 헤더 시작 가정
  bodyStartRowNumber: 2, // Excel 3행부터 바디 시작 가정
  headerNameToKey: {
    ['상품ID']: 'productId',
    ['상품명칭']: 'productName',
    ['가격']: 'price',
  },
  castNumber: false,
};

describe('CsvParser', () => {
  // 테스트 실행 전에 파일 Buffer를 메모리에 로드
  beforeAll(() => {
    if (!fs.existsSync(testFilePath)) {
      throw new Error(
        `Test file not found at: ${testFilePath}. Please create one.`
      );
    }
    testFileBuffer = fs.readFileSync(testFilePath);
  });

  it('should reflect Excel data to JSON structure', () => {
    // parse 함수 실행
    const result = ExcelSheetToJson.parseCSV(testFileBuffer, testOptions);

    console.log(result);
  });
});

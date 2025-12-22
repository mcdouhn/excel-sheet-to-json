// __tests__/index.test.ts
import * as path from 'path';
import * as fs from 'fs'; // Node.js 테스트 환경에서는 fs 사용 가능
import ExcelSheetToJson from '../src/index';

// 테스트 Excel 파일 경로 (예시: __tests__/test_data.xlsx)
const testFilePath = path.join(__dirname, 'test_data.xlsx');
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

describe('ExcelSheetToJson', () => {
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
    const result = ExcelSheetToJson.parse(testFileBuffer, testOptions);

    console.log(result);
    // 1. 결과 구조 검증
    // expect(result).toHaveProperty('originHeaderNames');
    // expect(result).toHaveProperty('fields');
    // expect(result).toHaveProperty('body');

    // // 2. 헤더 필드 검증 (매핑이 잘 되었는지)
    // expect(result.fields).toEqual(['productId', 'productName', 'price']);

    // // 3. 바디 데이터 검증 (JSON 객체 배열)
    // expect(Array.isArray(result.body)).toBe(true);
    // expect(result.body.length).toBeGreaterThan(0);

    // // 4. 첫 번째 레코드의 형식 검증
    // const firstRecord = result.body[0];
    // expect(firstRecord).toHaveProperty('productId');
    // expect(typeof firstRecord.productName).toBe('string');

    // // 특정 데이터가 올바르게 파싱되었는지 확인 (테스트 파일 내용에 따라 조정)
    // expect(firstRecord.productId).toBe(1001);
  });
});

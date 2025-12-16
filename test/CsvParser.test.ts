// test/CsvParser.test.ts
import * as path from 'path';
import * as fs from 'fs';
import { parseCSV } from '../src/index';

const testCsvFilePath = path.join(__dirname, 'test_data.csv');
let testCsvBuffer: Buffer;

const testCsvOptions = {
  delimiter: ',',
  encoding: 'utf-8' as BufferEncoding,
  headerStartRowNumber: 1,
  bodyStartRowNumber: 2,
  headerNameToKey: {
    '상품ID': 'productId',
    '상품명칭': 'productName',
    '가격': 'price',
    '재고수량': 'stock',
  },
};

describe('CSV Parser', () => {
  beforeAll(() => {
    if (!fs.existsSync(testCsvFilePath)) {
      throw new Error(
        `Test CSV file not found at: ${testCsvFilePath}. Please create one.`
      );
    }
    testCsvBuffer = fs.readFileSync(testCsvFilePath);
  });

  it('should parse CSV file correctly', () => {
    const result = parseCSV(testCsvBuffer, testCsvOptions);

    console.log('CSV Parse Result:', JSON.stringify(result, null, 2));

    // 1. 결과 구조 검증
    expect(result).toHaveProperty('originHeaderNames');
    expect(result).toHaveProperty('fields');
    expect(result).toHaveProperty('header');
    expect(result).toHaveProperty('body');
  });

  it('should have correct header mapping', () => {
    const result = parseCSV(testCsvBuffer, testCsvOptions);

    // 2. 필드 매핑 검증
    expect(result.fields).toEqual(['productId', 'productName', 'price', 'stock']);
    expect(result.header).toEqual({
      productId: '상품ID',
      productName: '상품명칭',
      price: '가격',
      stock: '재고수량',
    });
  });

  it('should parse body data correctly', () => {
    const result = parseCSV(testCsvBuffer, testCsvOptions);

    // 3. 바디 데이터 검증
    expect(Array.isArray(result.body)).toBe(true);
    expect(result.body.length).toBe(5);

    // 4. 첫 번째 레코드 검증
    const firstRecord = result.body[0];
    expect(firstRecord.productId).toBe(1001);
    expect(firstRecord.productName).toBe('노트북');
    expect(firstRecord.price).toBe(1500000);
    expect(firstRecord.stock).toBe(10);
  });

  it('should handle quoted fields with commas', () => {
    const result = parseCSV(testCsvBuffer, testCsvOptions);

    // 쉼표가 포함된 따옴표로 감싸진 필드 검증
    const thirdRecord = result.body[2];
    expect(thirdRecord.productName).toBe('키보드, 무선');
  });

  it('should handle escaped quotes', () => {
    const result = parseCSV(testCsvBuffer, testCsvOptions);

    // 이스케이프된 따옴표 검증
    const fifthRecord = result.body[4];
    expect(fifthRecord.productName).toBe('USB 허브 "고급형"');
  });

  it('should convert numeric strings to numbers', () => {
    const result = parseCSV(testCsvBuffer, testCsvOptions);

    // 숫자 타입 변환 검증
    result.body.forEach(record => {
      expect(typeof record.productId).toBe('number');
      expect(typeof record.price).toBe('number');
      expect(typeof record.stock).toBe('number');
    });
  });
});

// test/GoogleSheetParser.test.ts
import { parseGoogleSheet } from '../src/index';

describe('Google Sheet Parser', () => {
  // 실제 네트워크 요청을 사용하는 테스트이므로 타임아웃을 늘립니다
  jest.setTimeout(10000);

  describe('parseGoogleSheet', () => {
    it('should extract spreadsheet ID from valid URL', async () => {
      const result = await parseGoogleSheet(
        {
          spreadsheetId: '',
          sheetName: '시트1',
          apiKey: '',
        },
        {
          sheetName:'시트1',
          headerStartRowNumber: 1,
          bodyStartRowNumber: 1,
          headerNameToKey: {
            ['상품ID']: 'productId',
            ['상품명칭']: 'productName',
            ['바코드']: 'barcode',
            ['가격']: 'price',
          },
          castNumber:false,
        }
      );
      console.log(result);
    });
  });
});
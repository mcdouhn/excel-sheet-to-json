# excel-sheet-to-json

A TypeScript/JavaScript library that converts Excel and CSV files to JSON with custom header mapping. Works in both Node.js and browser environments.

## Features

- ✅ **Excel & CSV & Google Sheets Support**: Parse Excel (.xlsx, .xls), CSV files, and Google Sheets
- ✅ **Flexible Header Mapping**: Map Excel/CSV/Google Sheets headers (in any language) to your desired key names
- ✅ **Empty Row Handling**: Automatically filters out rows with no data
- ✅ **Universal**: Supports both Node.js and browser environments
- ✅ **TypeScript Support**: Fully typed with complete type definitions
- ✅ **Custom Row Selection**: Freely specify header and data start rows
- ✅ **Custom CSV Delimiter**: Support for comma, semicolon, tab, or any custom delimiter
- ✅ **Sheet Selection**: Select specific sheets by name in Excel and Google Sheets
- ✅ **Automatic Type Conversion**: Optional automatic number casting

## Installation

```bash
npm install excel-sheet-to-json
```

Or

```bash
yarn add excel-sheet-to-json
```

## Usage

### Node.js Environment

#### Parsing Excel Files (.xlsx, .xls)

```typescript
import * as fs from 'fs';
import { parse } from 'excel-sheet-to-json';

// Read Excel file
const fileBuffer = fs.readFileSync('./data.xlsx');

// Configure parsing options
const options = {
  headerStartRowNumber: 1, // Row number where headers are located (1-based)
  bodyStartRowNumber: 2, // Row number where data starts (1-based)
  headerNameToKey: {
    ['Product ID']: 'productId',
    ['Product Name']: 'productName',
    ['Price']: 'price',
  },
};

// Execute parsing
const result = parse(fileBuffer, options);

console.log(result);
```

#### Parsing CSV Files

```typescript
import * as fs from 'fs';
import { parseCSV } from 'excel-sheet-to-json';

// Read CSV file
const csvBuffer = fs.readFileSync('./data.csv');

// Configure CSV parsing options
const csvOptions = {
  headerStartRowNumber: 1,
  bodyStartRowNumber: 2,
  delimiter: ',', // CSV delimiter Optional (default: ',')
  encoding: 'utf-8', // File encoding Optional (default: 'utf-8')
  castNumber: true, // Automatically convert numeric strings to numbers (default: true)
  headerNameToKey: {
    ['Product ID']: 'productId',
    ['Product Name']: 'productName',
    ['Price']: 'price',
  },
};

// Execute CSV parsing
const result = parseCSV(csvBuffer, csvOptions);

console.log(result);
```

#### Parsing Google Sheets

```typescript
import { parseGoogleSheet } from 'excel-sheet-to-json';

// Configure Google Sheets parsing
const result = await parseGoogleSheet(
  {
    spreadsheetId: 'YOUR_SPREADSHEET_ID', // From the Google Sheets URL
    apiKey: 'YOUR_GOOGLE_API_KEY', // Google API key with Sheets API enabled
  },
  {
    sheetName: 'Sheet1', // Name of the sheet to parse
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    castNumber: true, // Automatically convert numeric strings to numbers (default: true)
    headerNameToKey: {
      ['Product ID']: 'productId',
      ['Product Name']: 'productName',
      ['Price']: 'price',
    },
  }
);

console.log(result);
```

> **Note**: The Google Sheets must be shared as "Anyone with the link can view" or you need proper API authentication.

### Browser Environment

#### Parsing Excel Files (.xlsx, .xls)

```typescript
import { parse, fileToArrayBufferInClient } from 'excel-sheet-to-json';

// Get file from file input element
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  // Convert File object to ArrayBuffer
  const arrayBuffer = await fileToArrayBufferInClient(file);

  // Configure parsing options
  const options = {
    sheetName: 'Sheet1', // Optional: specify sheet name (default: first sheet)
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    castNumber: true, // Optional: automatically convert numeric strings to numbers (default: true)
    headerNameToKey: {
      ['Product ID']: 'productId',
      ['Product Name']: 'productName',
      ['Price']: 'price',
    },
  };

  // Execute parsing
  const result = parse(arrayBuffer, options);

  console.log(result);
}
```

#### Parsing CSV Files

```typescript
import { parseCSV, fileToArrayBufferInClient } from 'excel-sheet-to-json';

// Get CSV file from file input element
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  // Convert File object to ArrayBuffer
  const arrayBuffer = await fileToArrayBufferInClient(file);

  // Configure CSV parsing options
  const csvOptions = {
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    delimiter: ',', // CSV delimiter Optional (default: ',')
    encoding: 'utf-8', // File encoding Optional (default: 'utf-8')
    headerNameToKey: {
      ['Product ID']: 'productId',
      ['Product Name']: 'productName',
      ['Price']: 'price',
    },
  };

  // Execute CSV parsing
  const result = parseCSV(arrayBuffer, csvOptions);

  console.log(result);
}
```

### NestJS Example

#### Complete Controller Example

```typescript
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse, parseCSV, ParseResult } from 'excel-sheet-to-json';

@Controller()
export class AppController {
  /**
   * Convert Excel to JSON Example
   */
  @Post('excel-to-json')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  excelToJson(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const fileBuffer = file.buffer; // File to Buffer

    const result: ParseResult = parse(fileBuffer, {
      headerStartRowNumber: 1,
      bodyStartRowNumber: 2,
      headerNameToKey: {
        ['Product ID']: 'productId',
        ['Product Name']: 'productName',
        ['Barcode']: 'barcode',
        ['Price']: 'price',
      },
    });

    return {
      message: 'Excel to Json',
      data: result,
    };
  }

  /**
   * Convert CSV to JSON Example
   */
  @Post('csv-to-json')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  csvToJson(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const fileBuffer = file.buffer; // File to Buffer

    const result: ParseResult = parseCSV(fileBuffer, {
      headerStartRowNumber: 1,
      bodyStartRowNumber: 2,
      delimiter: ',',
      encoding: 'utf-8',
      headerNameToKey: {
        ['Product ID']: 'productId',
        ['Product Name']: 'productName',
        ['Barcode']: 'barcode',
        ['Price']: 'price',
      },
    });

    return {
      message: 'CSV to Json',
      data: result,
    };
  }
}
```

## API

### `parse(fileBuffer, options)`

Converts an Excel file to JSON format.

#### Parameters

- `fileBuffer`: `Buffer | ArrayBuffer` - Buffer data of the Excel file
- `options`: `ParseOptions` - Parsing options
  - `headerStartRowNumber`: `number` - Row number where headers are located (1-based)
  - `bodyStartRowNumber`: `number` - Row number where data starts (1-based)
  - `headerNameToKey`: `{ [excelHeaderName: string]: string }` - Object mapping Excel header names to JSON keys
  - `sheetName`: `string` (optional) - Name of the sheet to parse (default: first sheet)
  - `castNumber`: `boolean` (optional) - Automatically convert numeric strings to numbers (default: true)

#### Returns

`ParseResult` object:

```typescript
{
  originHeaderNames: string[];           // Array of original Excel header names
  fields: string[];                      // Array of mapped key names
  header: { [key: string]: string };     // Mapping from key names to original header names
  body: any[];                           // Array of converted JSON data
}
```

### `parseCSV(fileBuffer, options)`

Converts a CSV file to JSON format.

#### Parameters

- `fileBuffer`: `Buffer | ArrayBuffer` - Buffer data of the CSV file
- `options`: `CsvParseOptions` - CSV parsing options
  - `headerStartRowNumber`: `number` - Row number where headers are located (1-based)
  - `bodyStartRowNumber`: `number` - Row number where data starts (1-based)
  - `headerNameToKey`: `{ [csvHeaderName: string]: string }` - Object mapping CSV header names to JSON keys
  - `delimiter`: `string` (optional) - CSV delimiter (default: `,`)
  - `encoding`: `BufferEncoding` (optional) - File encoding (default: `utf-8`)
  - `castNumber`: `boolean` (optional) - Automatically convert numeric strings to numbers (default: true)

#### Returns

`ParseResult` object (same structure as `parse()`)

### `parseGoogleSheet(config, options)`

Converts a Google Sheets document to JSON format.

#### Parameters

- `config`: `object` - Google Sheets configuration
  - `spreadsheetId`: `string` - The spreadsheet ID from the Google Sheets URL
  - `apiKey`: `string` - Google API key with Sheets API enabled
- `options`: `ParseOptions` - Parsing options
  - `sheetName`: `string` - Name of the sheet to parse (required)
  - `headerStartRowNumber`: `number` - Row number where headers are located (1-based)
  - `bodyStartRowNumber`: `number` - Row number where data starts (1-based)
  - `headerNameToKey`: `{ [headerName: string]: string }` - Object mapping header names to JSON keys
  - `castNumber`: `boolean` (optional) - Automatically convert numeric strings to numbers (default: true)

#### Returns

`Promise<ParseResult>` - Promise that resolves to ParseResult object

#### Example

```typescript
import { parseGoogleSheet } from 'excel-sheet-to-json';

const result = await parseGoogleSheet(
  {
    spreadsheetId: 'YOUR_SPREADSHEET_ID',
    apiKey: 'YOUR_API_KEY',
  },
  {
    sheetName: 'Class Data',
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    castNumber: true,
    headerNameToKey: {
      ['Student Name']: 'studentName',
      ['Grade']: 'grade',
    },
  }
);
```

> **Note**: To use Google Sheets API:
> 1. Enable Google Sheets API in Google Cloud Console
> 2. Create an API key
> 3. Make sure the spreadsheet is shared as "Anyone with the link can view"

### `fileToArrayBufferInClient(file)`

Converts a File object to ArrayBuffer in browser environment.

#### Parameters

- `file`: `File` - Browser File object

#### Returns

`Promise<ArrayBuffer>` - File data converted to ArrayBuffer


### ~~`arrayBufferToBufferInClient(arrayBuffer)`~~ ⚠️ DEPRECATED

**🚫 THIS FUNCTION IS DEPRECATED AND SHOULD NOT BE USED!**

Creating `Buffer` on the client side is NOT supported in browsers.

**✅ Use `fileToArrayBufferInClient()` and pass the `ArrayBuffer` directly to `parse()`:**

```typescript
const arrayBuffer = await fileToArrayBufferInClient(file);
const result = parse(arrayBuffer, options); // ArrayBuffer works directly
```

#### Parameters

- `arrayBuffer`: `ArrayBuffer` - ArrayBuffer to convert

#### Returns

`Buffer | null` - Converted Buffer object (will show deprecation warning)

## Example

### Input Excel File

| Product ID | Product Name | Price   |
| ---------- | ------------ | ------- |
| 1001       | Laptop       | 1500000 |
| 1002       | Mouse        | 25000   |
| 1003       | Keyboard     | 89000   |

### Parsing Excel Files (.xlsx, .xls)

```typescript
import * as fs from 'fs';
import { parse } from 'excel-sheet-to-json';

// Read Excel file
const fileBuffer = fs.readFileSync('./data.xlsx');

// Configure parsing options
const options = {
  headerStartRowNumber: 1, // Row number where headers are located (1-based)
  bodyStartRowNumber: 2, // Row number where data starts (1-based)
  headerNameToKey: {
    ['Product ID']: 'productId',
    ['Product Name']: 'productName',
    ['Price']: 'price',
  },
};

// Execute parsing
const result = parse(fileBuffer, options);

console.log(result);

```
### Output Result

```javascript
{
  originHeaderNames: ['Product ID', 'Product Name', 'Price'],
  fields: ['productId', 'productName', 'price'],
  header: {
    productId: 'Product ID',
    productName: 'Product Name',
    price: 'Price'
  },
  body: [
    { productId: 1001, productName: 'Laptop', price: 1500000 },
    { productId: 1002, productName: 'Mouse', price: 25000 },
    { productId: 1003, productName: 'Keyboard', price: 89000 }
  ]
}
```

## Important Notes

- By default, the first sheet of Excel files is processed (you can specify a sheet using `sheetName` option)
- For Google Sheets, you must specify the `sheetName` in options
- Columns not mapped in `headerNameToKey` will not be included in the result
- Empty rows (rows with all cells empty) are automatically filtered out
- Row numbers start from 1 (same as Excel row numbers)
- Numeric strings are automatically converted to numbers by default (disable with `castNumber: false`)

## License

MIT

## Contributing

Issues and Pull Requests are always welcome!

## Author

Mcdouhn

Excel과 CSV 파일을 사용자 정의 헤더 매핑을 통해 JSON으로 변환하는 TypeScript/JavaScript 라이브러리입니다. Node.js와 브라우저 환경 모두에서 사용할 수 있습니다.

## 특징

- ✅ **Excel & CSV & Google Sheets 지원**: Excel(.xlsx, .xls), CSV 파일, 구글 스프레드시트 모두 파싱 가능
- ✅ **유연한 헤더 매핑**: Excel/CSV/Google Sheets의 한글 헤더를 원하는 키 이름으로 매핑
- ✅ **빈 행 무시**: 데이터가 없는 행은 자동으로 제외
- ✅ **범용성**: Node.js와 브라우저 환경 모두 지원
- ✅ **TypeScript 지원**: 완전한 타입 정의 제공
- ✅ **커스텀 행 지정**: 헤더와 데이터 시작 행을 자유롭게 설정
- ✅ **CSV 구분자 설정**: 쉼표, 세미콜론, 탭 등 원하는 구분자 지정 가능
- ✅ **시트 선택**: Excel과 Google Sheets에서 시트 이름으로 특정 시트 선택 가능
- ✅ **자동 타입 변환**: 숫자 문자열을 자동으로 숫자로 변환 (선택적)

## 설치

```bash
npm install excel-sheet-to-json
```

또는

```bash
yarn add excel-sheet-to-json
```

## 사용법

### Node.js 환경

#### Excel 파일 파싱 (.xlsx, .xls)

```typescript
import * as fs from 'fs';
import { parse } from 'excel-sheet-to-json';

// Excel 파일 읽기
const fileBuffer = fs.readFileSync('./data.xlsx');

// 파싱 옵션 설정
const options = {
  sheetName: 'Sheet1', // 선택사항: 시트 이름 지정 (기본값: 첫 번째 시트)
  headerStartRowNumber: 1, // 헤더가 있는 행 번호 (1-based)
  bodyStartRowNumber: 2, // 데이터가 시작되는 행 번호 (1-based)
  castNumber: true, // 선택사항: 숫자 문자열을 자동으로 숫자로 변환 (기본값: true)
  headerNameToKey: {
    ['상품ID']: 'productId',
    ['상품명칭']: 'productName',
    ['가격']: 'price',
  },
};

// 파싱 실행
const result = parse(fileBuffer, options);

console.log(result);
```

#### CSV 파일 파싱

```typescript
import * as fs from 'fs';
import { parseCSV } from 'excel-sheet-to-json';

// CSV 파일 읽기
const csvBuffer = fs.readFileSync('./data.csv');

// CSV 파싱 옵션 설정
const csvOptions = {
  headerStartRowNumber: 1,
  bodyStartRowNumber: 2,
  delimiter: ',', // CSV 구분자 (기본값: ',')
  encoding: 'utf-8', // 파일 인코딩 (기본값: 'utf-8')
  castNumber: true, // 숫자 문자열을 자동으로 숫자로 변환 (기본값: true)
  headerNameToKey: {
    ['상품ID']: 'productId',
    ['상품명칭']: 'productName',
    ['가격']: 'price',
  },
};

// CSV 파싱 실행
const result = parseCSV(csvBuffer, csvOptions);

console.log(result);
```

#### Google Sheets 파싱

```typescript
import { parseGoogleSheet } from 'excel-sheet-to-json';

// Google Sheets 파싱 설정
const result = await parseGoogleSheet(
  {
    spreadsheetId: 'YOUR_SPREADSHEET_ID', // Google Sheets URL에서 추출
    apiKey: 'YOUR_GOOGLE_API_KEY', // Sheets API가 활성화된 Google API 키
  },
  {
    sheetName: 'Sheet1', // 파싱할 시트 이름
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    castNumber: true, // 숫자 문자열을 자동으로 숫자로 변환 (기본값: true)
    headerNameToKey: {
      ['상품ID']: 'productId',
      ['상품명칭']: 'productName',
      ['가격']: 'price',
    },
  }
);

console.log(result);
```

> **참고**: Google Sheets는 "링크가 있는 모든 사용자" 공유 설정이 필요하거나 적절한 API 인증이 필요합니다.

### 브라우저 환경

#### Excel 파일 파싱 (.xlsx, .xls)

```typescript
import { parse, fileToArrayBufferInClient } from 'excel-sheet-to-json';

// 파일 input 요소에서 파일 가져오기
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  // File 객체를 ArrayBuffer로 변환
  const arrayBuffer = await fileToArrayBufferInClient(file);

  // 파싱 옵션 설정
  const options = {
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    headerNameToKey: {
      ['상품ID']: 'productId',
      ['상품명칭']: 'productName',
      ['가격']: 'price',
    },
  };

  // 파싱 실행
  const result = parse(arrayBuffer, options);

  console.log(result);
}
```

#### CSV 파일 파싱

```typescript
import { parseCSV, fileToArrayBufferInClient } from 'excel-sheet-to-json';

// 파일 input 요소에서 CSV 파일 가져오기
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  // File 객체를 ArrayBuffer로 변환
  const arrayBuffer = await fileToArrayBufferInClient(file);

  // CSV 파싱 옵션 설정
  const csvOptions = {
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    delimiter: ',', // (선택적) 기본값 ','
    encoding: 'utf-8', // (선택적) 기본값 'utf-8'
    headerNameToKey: {
      ['상품ID']: 'productId',
      ['상품명칭']: 'productName',
      ['가격']: 'price',
    },
  };

  // CSV 파싱 실행
  const result = parseCSV(arrayBuffer, csvOptions);

  console.log(result);
}
```

### NestJS 예시

#### 전체 컨트롤러 예제

```typescript
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse, parseCSV, ParseResult } from 'excel-sheet-to-json';

@Controller()
export class AppController {
  /**
   * Excel을 JSON으로 변환하는 예제
   */
  @Post('excel-to-json')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  excelToJson(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const fileBuffer = file.buffer; // File to Buffer

    const result: ParseResult = parse(fileBuffer, {
      headerStartRowNumber: 1,
      bodyStartRowNumber: 2,
      headerNameToKey: {
        ['상품ID']: 'productId',
        ['상품명칭']: 'productName',
        ['바코드']: 'barcode',
        ['가격']: 'price',
      },
    });

    return {
      message: 'Excel to Json',
      data: result,
    };
  }

  /**
   * CSV를 JSON으로 변환하는 예제
   */
  @Post('csv-to-json')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  csvToJson(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const fileBuffer = file.buffer; // File to Buffer

    const result: ParseResult = parseCSV(fileBuffer, {
      headerStartRowNumber: 1,
      bodyStartRowNumber: 2,
      delimiter: ',', // (선택적) 기본값 ','
      encoding: 'utf-8', // (선택적) 기본값 'utf-8'
      headerNameToKey: {
        ['상품ID']: 'productId',
        ['상품명칭']: 'productName',
        ['바코드']: 'barcode',
        ['가격']: 'price',
      },
    });

    return {
      message: 'CSV to Json',
      data: result,
    };
  }
}
```

## API

### `parse(fileBuffer, options)`

Excel 파일을 JSON으로 변환합니다.

#### Parameters

- `fileBuffer`: `Buffer | ArrayBuffer` - Excel 파일의 버퍼 데이터
- `options`: `ParseOptions` - 파싱 옵션
  - `headerStartRowNumber`: `number` - 헤더가 있는 행 번호 (1-based)
  - `bodyStartRowNumber`: `number` - 데이터가 시작되는 행 번호 (1-based)
  - `headerNameToKey`: `{ [excelHeaderName: string]: string }` - Excel 헤더 이름을 JSON 키로 매핑하는 객체
  - `sheetName`: `string` (선택) - 파싱할 시트 이름 (기본값: 첫 번째 시트)
  - `castNumber`: `boolean` (선택) - 숫자 문자열을 자동으로 숫자로 변환 (기본값: true)

#### Returns

`ParseResult` 객체:

```typescript
{
  originHeaderNames: string[];           // 원본 Excel 헤더 이름 배열
  fields: string[];                      // 매핑된 키 이름 배열
  header: { [key: string]: string };     // 키 이름 -> 원본 헤더 이름 매핑
  body: any[];                           // 변환된 JSON 데이터 배열
}
```

### `parseCSV(fileBuffer, options)`

CSV 파일을 JSON으로 변환합니다.

#### Parameters

- `fileBuffer`: `Buffer | ArrayBuffer` - CSV 파일의 버퍼 데이터
- `options`: `CsvParseOptions` - CSV 파싱 옵션
  - `headerStartRowNumber`: `number` - 헤더가 있는 행 번호 (1-based)
  - `bodyStartRowNumber`: `number` - 데이터가 시작되는 행 번호 (1-based)
  - `headerNameToKey`: `{ [csvHeaderName: string]: string }` - CSV 헤더 이름을 JSON 키로 매핑하는 객체
  - `delimiter`: `string` (선택) - CSV 구분자 (기본값: `,`)
  - `encoding`: `BufferEncoding` (선택) - 파일 인코딩 (기본값: `utf-8`)
  - `castNumber`: `boolean` (선택) - 숫자 문자열을 자동으로 숫자로 변환 (기본값: true)

#### Returns

`ParseResult` 객체 (`parse()`와 동일한 구조)

### `parseGoogleSheet(config, options)`

Google Sheets 문서를 JSON으로 변환합니다.

#### Parameters

- `config`: `object` - Google Sheets 설정
  - `spreadsheetId`: `string` - Google Sheets URL의 스프레드시트 ID
  - `apiKey`: `string` - Sheets API가 활성화된 Google API 키
- `options`: `ParseOptions` - 파싱 옵션
  - `sheetName`: `string` - 파싱할 시트 이름 (필수)
  - `headerStartRowNumber`: `number` - 헤더가 있는 행 번호 (1-based)
  - `bodyStartRowNumber`: `number` - 데이터가 시작되는 행 번호 (1-based)
  - `headerNameToKey`: `{ [headerName: string]: string }` - 헤더 이름을 JSON 키로 매핑하는 객체
  - `castNumber`: `boolean` (선택) - 숫자 문자열을 자동으로 숫자로 변환 (기본값: true)

#### Returns

`Promise<ParseResult>` - ParseResult 객체로 resolve되는 Promise

#### 예제

```typescript
import { parseGoogleSheet } from 'excel-sheet-to-json';

const result = await parseGoogleSheet(
  {
    spreadsheetId: 'YOUR_SPREADSHEET_ID',
    apiKey: 'YOUR_API_KEY',
  },
  {
    sheetName: '학생 데이터',
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    castNumber: true,
    headerNameToKey: {
      ['학생 이름']: 'studentName',
      ['성적']: 'grade',
    },
  }
);
```

> **참고**: Google Sheets API 사용하기:
> 1. Google Cloud Console에서 Google Sheets API 활성화
> 2. API 키 생성
> 3. 스프레드시트를 "링크가 있는 모든 사용자"로 공유 설정

### `fileToArrayBufferInClient(file)`

브라우저 환경에서 File 객체를 ArrayBuffer로 변환합니다.

#### Parameters

- `file`: `File` - 브라우저 File 객체

#### Returns

`Promise<ArrayBuffer>` - ArrayBuffer로 변환된 파일 데이터


### ~~`arrayBufferToBufferInClient(arrayBuffer)`~~ ⚠️ 사용 중단됨

**🚫 이 함수는 더 이상 사용하지 마세요!**

브라우저에서 `Buffer`를 직접 생성하는 것은 지원되지 않습니다.

**✅ `fileToArrayBufferInClient()`를 사용하고 `ArrayBuffer`를 `parse()`에 직접 전달하세요:**

```typescript
const arrayBuffer = await fileToArrayBufferInClient(file);
const result = parse(arrayBuffer, options); // ArrayBuffer를 직접 사용 가능
```

#### Parameters

- `arrayBuffer`: `ArrayBuffer` - 변환할 ArrayBuffer

#### Returns

`Buffer | null` - 변환된 Buffer 객체 (사용 중단 경고 표시됨)

## 예제

### 입력 Excel 파일

| 상품ID | 상품명칭 | 가격    |
| ------ | -------- | ------- |
| 1001   | 노트북   | 1500000 |
| 1002   | 마우스   | 25000   |
| 1003   | 키보드   | 89000   |

#### Excel 파일 파싱 (.xlsx, .xls)

```typescript
import * as fs from 'fs';
import { parse } from 'excel-sheet-to-json';

// Excel 파일 읽기
const fileBuffer = fs.readFileSync('./data.xlsx');

// 파싱 옵션 설정
const options = {
  sheetName: 'Sheet1', // 선택사항: 시트 이름 지정 (기본값: 첫 번째 시트)
  headerStartRowNumber: 1, // 헤더가 있는 행 번호 (1-based)
  bodyStartRowNumber: 2, // 데이터가 시작되는 행 번호 (1-based)
  castNumber: true, // 선택사항: 숫자 문자열을 자동으로 숫자로 변환 (기본값: true)
  headerNameToKey: {
    ['상품ID']: 'productId',
    ['상품명칭']: 'productName',
    ['가격']: 'price',
  },
};

// 파싱 실행
const result = parse(fileBuffer, options);

console.log(result);
```

### 출력 결과

```javascript
{
  originHeaderNames: ['상품ID', '상품명칭', '가격'],
  fields: ['productId', 'productName', 'price'],
  header: {
    productId: '상품ID',
    productName: '상품명칭',
    price: '가격'
  },
  body: [
    { productId: 1001, productName: '노트북', price: 1500000 },
    { productId: 1002, productName: '마우스', price: 25000 },
    { productId: 1003, productName: '키보드', price: 89000 }
  ]
}
```

## 주의사항

- 기본적으로 Excel 파일의 첫 번째 시트가 처리됩니다 (`sheetName` 옵션으로 특정 시트 지정 가능)
- Google Sheets의 경우 options에 `sheetName`을 반드시 지정해야 합니다
- `headerNameToKey`에 매핑되지 않은 열은 결과에 포함되지 않습니다
- 빈 행(모든 셀이 비어있는 행)은 자동으로 제외됩니다
- 행 번호는 1부터 시작합니다 (Excel 행 번호와 동일)
- 숫자 문자열은 기본적으로 자동으로 숫자로 변환됩니다 (`castNumber: false`로 비활성화 가능)

## 라이선스

MIT

## 기여

이슈나 Pull Request는 언제나 환영합니다!

## 작성자

Mcdouhn

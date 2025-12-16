# excel-sheet-to-json

A TypeScript/JavaScript library that converts Excel files to JSON with custom header mapping. Works in both Node.js and browser environments.

## Features

- ✅ **Flexible Header Mapping**: Map Excel headers (in any language) to your desired key names
- ✅ **Empty Row Handling**: Automatically filters out rows with no data
- ✅ **Universal**: Supports both Node.js and browser environments
- ✅ **TypeScript Support**: Fully typed with complete type definitions
- ✅ **Custom Row Selection**: Freely specify header and data start rows

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

```typescript
import * as fs from 'fs';
import { parse } from 'excel-sheet-to-json';

// Read Excel file
const fileBuffer = fs.readFileSync('./data.xlsx');

// Configure parsing options
const options = {
  headerStartRowNumber: 1,     // Row number where headers are located (1-based)
  bodyStartRowNumber: 2,        // Row number where data starts (1-based)
  headerNameToKey: {
    'Product ID': 'productId',
    'Product Name': 'productName',
    'Price': 'price',
  }
};

// Execute parsing
const result = parse(fileBuffer, options);

console.log(result);
```

### Browser Environment

```typescript
import { parse, fileToArrayBufferInClient, arrayBufferToBufferInClient } from 'excel-sheet-to-json';

// Get file from file input element
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  // Convert File object to ArrayBuffer
  const arrayBuffer = await fileToArrayBufferInClient(file);
  
  // Convert ArrayBuffer to Buffer (required for parsing)
  const buffer = arrayBufferToBufferInClient(arrayBuffer);
  
  // Configure parsing options
  const options = {
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    headerNameToKey: {
      'Product ID': 'productId',
      'Product Name': 'productName',
      'Price': 'price',
    }
  };
  
  // Execute parsing
  const result = parse(buffer, options);
  
  console.log(result);
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

### `fileToArrayBufferInClient(file)`

Converts a File object to ArrayBuffer in browser environment.

#### Parameters

- `file`: `File` - Browser File object

#### Returns

`Promise<ArrayBuffer>` - File data converted to ArrayBuffer

### `arrayBufferToBufferInClient(arrayBuffer)`

Converts ArrayBuffer to Buffer.

#### Parameters

- `arrayBuffer`: `ArrayBuffer` - ArrayBuffer to convert

#### Returns

`Buffer` - Converted Buffer object

## Example

### Input Excel File

| Product ID | Product Name | Price   |
|------------|--------------|---------|
| 1001       | Laptop       | 1500000 |
| 1002       | Mouse        | 25000   |
| 1003       | Keyboard     | 89000   |

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

- Only the first sheet of the Excel file is processed
- Columns not mapped in `headerNameToKey` will not be included in the result
- Empty rows (rows with all cells empty) are automatically filtered out
- Row numbers start from 1 (same as Excel row numbers)

## License

MIT

## Contributing

Issues and Pull Requests are always welcome!

## Author

Mcdouhn



Excel 파일을 사용자 정의 헤더 매핑을 통해 JSON으로 변환하는 TypeScript/JavaScript 라이브러리입니다. Node.js와 브라우저 환경 모두에서 사용할 수 있습니다.

## 특징

- ✅ **유연한 헤더 매핑**: Excel의 한글 헤더를 원하는 키 이름으로 매핑
- ✅ **빈 행 무시**: 데이터가 없는 행은 자동으로 제외
- ✅ **범용성**: Node.js와 브라우저 환경 모두 지원
- ✅ **TypeScript 지원**: 완전한 타입 정의 제공
- ✅ **커스텀 행 지정**: 헤더와 데이터 시작 행을 자유롭게 설정

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

```typescript
import * as fs from 'fs';
import { parse } from 'excel-sheet-to-json';

// Excel 파일 읽기
const fileBuffer = fs.readFileSync('./data.xlsx');

// 파싱 옵션 설정
const options = {
  headerStartRowNumber: 1,     // 헤더가 있는 행 번호 (1-based)
  bodyStartRowNumber: 2,        // 데이터가 시작되는 행 번호 (1-based)
  headerNameToKey: {
    '상품ID': 'productId',
    '상품명칭': 'productName',
    '가격': 'price',
  }
};

// 파싱 실행
const result = parse(fileBuffer, options);

console.log(result);
```

### 브라우저 환경

```typescript
import { parse, fileToArrayBufferInClient, arrayBufferToBufferInClient } from 'excel-sheet-to-json';

// 파일 input 요소에서 파일 가져오기
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  // File 객체를 ArrayBuffer로 변환
  const arrayBuffer = await fileToArrayBufferInClient(file);
  
  // ArrayBuffer를 Buffer로 변환 (파싱에 필요)
  const buffer = arrayBufferToBufferInClient(arrayBuffer);
  
  // 파싱 옵션 설정
  const options = {
    headerStartRowNumber: 1,
    bodyStartRowNumber: 2,
    headerNameToKey: {
      '상품ID': 'productId',
      '상품명칭': 'productName',
      '가격': 'price',
    }
  };
  
  // 파싱 실행
  const result = parse(buffer, options);
  
  console.log(result);
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

### `fileToArrayBufferInClient(file)`

브라우저 환경에서 File 객체를 ArrayBuffer로 변환합니다.

#### Parameters

- `file`: `File` - 브라우저 File 객체

#### Returns

`Promise<ArrayBuffer>` - ArrayBuffer로 변환된 파일 데이터

### `arrayBufferToBufferInClient(arrayBuffer)`

ArrayBuffer를 Buffer로 변환합니다.

#### Parameters

- `arrayBuffer`: `ArrayBuffer` - 변환할 ArrayBuffer

#### Returns

`Buffer` - 변환된 Buffer 객체

## 예제

### 입력 Excel 파일

| 상품ID | 상품명칭 | 가격 |
|--------|----------|------|
| 1001   | 노트북   | 1500000 |
| 1002   | 마우스   | 25000 |
| 1003   | 키보드   | 89000 |

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

- Excel 파일의 첫 번째 시트만 처리됩니다
- `headerNameToKey`에 매핑되지 않은 열은 결과에 포함되지 않습니다
- 빈 행(모든 셀이 비어있는 행)은 자동으로 제외됩니다
- 행 번호는 1부터 시작합니다 (Excel 행 번호와 동일)User Guide

Congrats! You just saved yourself hours of work by bootstrapping this project with TSDX. Let’s get you oriented with what’s here and how to use it.

> This TSDX setup is meant for developing libraries (not apps!) that can be published to NPM. If you’re looking to build a Node app, you could use `ts-node-dev`, plain `ts-node`, or simple `tsc`.

> If you’re new to TypeScript, checkout [this handy cheatsheet](https://devhints.io/typescript)


## 라이선스

MIT

## 기여

이슈나 Pull Request는 언제나 환영합니다!

## 작성자

Mcdouhn


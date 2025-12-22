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

/**
 * @deprecated
 * This code is no longer used. Creating Buffer directly on the client side is not recommended.
 * When parsing on the client, please use the @fileToArrayBufferInClient function to work with ArrayBuffer directly.
 * Example) parseCSV(arrayBuffer, options);
 *
 * 이 코드는 더이상 사용되지 않습니다. 클라이언트에서 Buffer를 직접 생성하는 것은 권장되지 않습니다.
 * 클라이언트에서 파싱을 진행할 시 @fileToArrayBufferInClient 함수를 이용해 ArrayBuffer를 직접 사용하시기 바랍니다.
 * 예시) parseCSV(arrayBuffer, options);
 *
 * ArrayBuffer를 Buffer로 변환합니다.
 * @param arrayBuffer - 변환할 ArrayBuffer
 * @returns Buffer 객체 또는 null
 */
export function arrayBufferToBufferInClient(
  arrayBuffer: ArrayBuffer
): Buffer | null {
  console.error(
    '⚠️  DEPRECATED WARNING ⚠️\n' +
      '═══════════════════════════════════════════════════════════════\n' +
      'This function is DEPRECATED and should NOT be used!\n' +
      'Creating Buffer on the client side is NOT supported in browsers.\n' +
      '\n' +
      '✅ SOLUTION: Use fileToArrayBufferInClient() instead.\n' +
      '   Example: const arrayBuffer = await fileToArrayBufferInClient(file);\n' +
      '            parseCSV(arrayBuffer, options);\n' +
      '═══════════════════════════════════════════════════════════════'
  );
  // throw new Error('This function is deprecated and should not be used.');
  return Buffer.from(arrayBuffer);
}

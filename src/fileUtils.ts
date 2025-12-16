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
 * ArrayBuffer를 Buffer로 변환합니다.
 * @param arrayBuffer - 변환할 ArrayBuffer
 * @returns Buffer 객체
 */
export function arrayBufferToBufferInClient(arrayBuffer: ArrayBuffer): Buffer {
  return Buffer.from(arrayBuffer);
}

// 메모리상의 Blob을 사용자 다운로드로 내보낸다.
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  // 일부 브라우저는 document에 붙지 않은 앵커의 click을 무시하므로 잠깐 붙였다 뗀다.
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // 즉시 해제하면 다운로드가 취소되는 브라우저가 있어 다음 tick에 revoke한다.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

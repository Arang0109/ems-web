const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * 바이트 수를 사람이 읽는 단위로 변환한다. `1536` → `'1.5 KB'`
 * 1KB 미만은 소수점 없이 바이트로, 그 이상은 소수점 한 자리까지 표시한다.
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return '';
  if (bytes <= 0) return '0 B';

  // 1024^exponent 단위로 떨어뜨리되, 정의된 단위를 넘지 않도록 상한을 둔다.
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;

  return exponent === 0 ? `${bytes} B` : `${value.toFixed(1)} ${UNITS[exponent]}`;
}

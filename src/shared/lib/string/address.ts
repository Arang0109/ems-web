/** 도로명 + 상세주소 한 줄. 상세주소가 비어도 끝에 공백이 남지 않는다 */
export function formatAddress(roadAddress: string, detailAddress: string): string {
  return [roadAddress, detailAddress].map((part) => part?.trim()).filter(Boolean).join(' ');
}

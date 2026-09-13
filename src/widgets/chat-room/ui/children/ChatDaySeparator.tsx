interface Props {
  label: string;
}

/**
 * 대화 사이의 날짜 구분선.
 *
 * `shared/ui` 의 `Divider`(선 위 텍스트)를 쓰지 않는다 — 그쪽은 배경색을 `bg-background`
 * 로 박아 두고 `className` 도 받지 않아서, 대화 영역 배경 위에 올리면 글자 뒤가 어긋난다.
 * 알약 형태가 스크롤되는 말풍선 사이에서도 잘 읽힌다.
 */
export const ChatDaySeparator = ({ label }: Props) => (
  <div className="flex justify-center py-3">
    <span className="rounded-full bg-canvas px-3 py-1 text-caption text-muted-ink">{label}</span>
  </div>
);

import { FormDialog, InputGroup, Select } from "ems-web";

/**
 * 등록·수정 폼 모달. `open` 을 넘기면 열림 상태를 부모가 소유한다 —
 * 취소/제출 버튼과 미저장 이탈 경고는 셸이 맡는다.
 */
export const Open = () => (
  <FormDialog
    open
    title="의뢰기관 등록"
    description="사업자등록증의 상호와 동일하게 입력합니다."
    submitLabel="등록"
    cancelLabel="취소"
  >
    <div className="flex flex-col gap-3">
      <InputGroup label="의뢰기관명" value="한국환경공단" required />
      <InputGroup label="사업자번호" value="123-45-67890" required />
      <Select
        label="측정분야"
        value="AIR"
        options={[
          { value: "AIR", label: "대기" },
          { value: "WATER", label: "수질" },
        ]}
      />
    </div>
  </FormDialog>
);

/** 수정 모드 — 삭제 버튼이 함께 나온다 */
export const WithDelete = () => (
  <FormDialog
    open
    title="의뢰기관 수정"
    submitLabel="저장"
    deleteLabel="삭제"
    cancelLabel="취소"
    onDelete={() => {}}
  >
    <div className="flex flex-col gap-3">
      <InputGroup label="의뢰기관명" value="대한제철 포항공장" />
      <InputGroup label="대표자" value="박지훈" />
    </div>
  </FormDialog>
);

/** 저장 중 — 제출 버튼이 로딩 문구로 바뀌고 비활성된다 */
export const Loading = () => (
  <FormDialog open title="의뢰기관 등록" submitLabel="등록" isLoading loadingLabel="등록 중...">
    <InputGroup label="의뢰기관명" value="그린에너지발전" />
  </FormDialog>
);

import { useRecordInspection } from "../model/hooks/use-record-inspection";
import { RecordInspectionFields } from "./RecordInspectionFields";

import type { InspectionType } from "@shared/model";

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, SectionTitle } from "@shared/ui/form";
import { INSPECTION_TYPE_LABEL, INSPECTION_RESULT_LABEL } from "@shared/config";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId: string | null;
  equipmentName: string;
  type: InspectionType;
  /** 장비 상세 재조회 — 최종 수검일·다음 예정일이 갱신된다. */
  onSuccess?: () => void;
}

export const InspectionHistoryDialog = ({
  open, onOpenChange, equipmentId, equipmentName, type, onSuccess,
}: Props) => {
  const {
    form, records, loading, isLoading, fieldErrors, handleChange, handleSubmit,
  } = useRecordInspection({ equipmentId, type, onSuccess });

  if (!equipmentId) return null;

  return (
    <FormDialog
      title={`${equipmentName} · ${INSPECTION_TYPE_LABEL[type]} 이력`}
      size="lg"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="이력 등록"
      loadingLabel="등록 중..."
      isLoading={isLoading}
    >
      <FieldGroup>
        <RecordInspectionFields form={form} fieldErrors={fieldErrors} onChange={handleChange} />

        <Divider />

        <SectionTitle>수검 이력</SectionTitle>
        {loading && <p className="text-body-2 text-muted-foreground">이력을 불러오는 중입니다...</p>}
        {!loading && records.length === 0 && (
          <p className="text-body-2 text-muted-foreground">등록된 수검 이력이 없습니다.</p>
        )}
        {!loading && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-border text-body-4 text-muted-foreground">
                  <th className="py-2 text-left font-normal">실시일</th>
                  <th className="py-2 text-left font-normal">유효기간</th>
                  <th className="py-2 text-left font-normal">검사기관</th>
                  <th className="py-2 text-left font-normal">성적서 번호</th>
                  <th className="py-2 text-left font-normal">판정</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-border last:border-b-0">
                    <td className="py-2.5 text-body-2 text-foreground whitespace-nowrap">{record.inspectedAt}</td>
                    <td className="py-2.5 text-body-2 text-muted-foreground whitespace-nowrap">{record.validUntil ?? '—'}</td>
                    <td className="py-2.5 text-body-2 text-foreground">{record.agency || '—'}</td>
                    <td className="py-2.5 text-body-2 text-foreground">{record.certificateNumber || '—'}</td>
                    <td className="py-2.5 text-body-2 text-foreground whitespace-nowrap">
                      {record.result ? INSPECTION_RESULT_LABEL[record.result] : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </FieldGroup>
    </FormDialog>
  );
};

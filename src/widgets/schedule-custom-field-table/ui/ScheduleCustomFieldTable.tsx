import { useScheduleCustomFieldTable } from "../model/use-schedule-custom-field-table";
import { scheduleCustomFieldCardConfig } from "../model/mobile-card";

import { RegisterScheduleCustomFieldForm } from "@features/register-schedule-custom-field";
import { UpdateScheduleCustomFieldForm } from "@features/update-schedule-custom-field";

import { BasicTable, TableFooterBar, TablePanel } from "@shared/ui/table";
import { Search } from "@shared/ui/form";
import { useRemountKey } from "@shared/model";

/**
 * 커스텀 필드 정의 목록. 성적서 양식이 `${custom.<key>}` 로 읽을 이름을 관리한다 —
 * 값은 측정계획마다 "추가 항목" 탭에서 따로 입력한다.
 */
export const ScheduleCustomFieldTable = () => {
  const {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailId, detailField,

    globalFilter, setGlobalFilter,

    isLoading, error,
  } = useScheduleCustomFieldTable();

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    <>
      <TablePanel
        title="커스텀 필드 목록"
        actions={
          <>
            <Search value={globalFilter} onChange={setGlobalFilter} placeholder={"이름, 양식 이름 검색 ..."} />
            <RegisterScheduleCustomFieldForm
              key={registerFormKey}
              open={registerModalOpen}
              onOpenChange={setRegisterModalOpen}
            />
          </>
        }
        footer={!isLoading && !error && <TableFooterBar table={table} />}
      >
        <BasicTable
          table={table}
          loading={isLoading}
          error={error}
          onRowClick={handleRowClick}
          mobileCard={scheduleCustomFieldCardConfig}
        />
      </TablePanel>

      <UpdateScheduleCustomFieldForm
        key={`${updateFormKey}-${detailId}`}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        field={detailField}
      />
    </>
  );
};

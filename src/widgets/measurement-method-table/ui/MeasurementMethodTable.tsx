import { useMeasurementMethodTable } from "../model/use-measurement-method-table";
import { measurementMethodCardConfig } from "../model/mobile-card";

import { RegisterMeasurementMethodForm } from "@features/register-measurement-method";
import { UpdateMeasurementMethodForm } from "@features/update-measurement-method";
import { FillDefaultMeasurementMethodsButton } from "@features/fill-default-measurement-methods";

import { BasicTable, TableFooterBar, TablePanel } from "@shared/ui/table";
import { Search } from "@shared/ui/form";
import { useRemountKey } from "@shared/model";

/**
 * 측정방법 목록. 채취 단위·통칭명·표준 채취시간이 물질이 아니라 여기 있다 —
 * 한 방법을 고치면 그 방법을 쓰는 측정물질 전부에 반영된다.
 */
export const MeasurementMethodTable = () => {
  const {
    table,
    methodCount,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailId, detailMethod,

    globalFilter, setGlobalFilter,

    isLoading, error,
  } = useMeasurementMethodTable();

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const registerFormKey = useRemountKey(registerModalOpen);
  const updateFormKey = useRemountKey(updateModalOpen);

  return (
    <>
      <TablePanel
        title="측정방법 목록"
        actions={
          <>
            <Search value={globalFilter} onChange={setGlobalFilter} placeholder={"측정방법, 통칭명 검색 ..."} />
            <FillDefaultMeasurementMethodsButton currentCount={methodCount} />
            <RegisterMeasurementMethodForm
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
          mobileCard={measurementMethodCardConfig}
        />
      </TablePanel>

      <UpdateMeasurementMethodForm
        key={`${updateFormKey}-${detailId}`}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        method={detailMethod}
      />
    </>
  );
};

export type CanceledScheduleTableRow = {
  id: string;
  measureDate: string;        // yyyy-MM-dd
  referenceNumber: string;
  clientName: string;
  workplaceName: string;
  stackName: string;
  teamName: string;
  canceledDate: string;       // yyyy-MM-dd
  cancelReason: string;
};

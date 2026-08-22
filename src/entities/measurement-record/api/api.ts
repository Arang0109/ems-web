import { axiosPrivate } from '@shared/api';
import type { ApiResponseMessage } from '@shared/model';
import type { MeasurementRecordListResponse } from './dto';

export const measurementRecordApi = {
  // year 를 생략하면 전체 기간이다.
  getMeasurementRecords: async (
    stackId: number, year?: number | null,
  ): Promise<ApiResponseMessage<MeasurementRecordListResponse[]>> => {
    const res = await axiosPrivate.get('/measurement-records', {
      params: year == null ? { stackId } : { stackId, year },
    });
    return res.data;
  },
};

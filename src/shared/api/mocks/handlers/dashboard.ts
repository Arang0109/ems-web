import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api';

/** 오늘 기준 상대 날짜. 날짜와 daysRemaining 이 어긋나지 않도록 요청 시점에 계산한다. */
const isoDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const dashboardHandlers = [
  http.get(`${BASE_URL}/dashboard/measurement-stats`, () => {
    return HttpResponse.json({
      status: true,
      message: '측정건수 통계 조회 성공',
      data: [
        { label: '1월', count: 142 },
        { label: '2월', count: 98 },
        { label: '3월', count: 175 },
        { label: '4월', count: 203 },
        { label: '5월', count: 187 },
        { label: '6월', count: 221 },
        { label: '7월', count: 264 },
        { label: '8월', count: 198 },
        { label: '9월', count: 231 },
        { label: '10월', count: 189 },
        { label: '11월', count: 167 },
        { label: '12월', count: 143 }
      ],
    });
  }),

  http.get(`${BASE_URL}/dashboard/summary`, () => {
    return HttpResponse.json({
      status: true,
      message: '대시보드 요약 조회 성공',
      data: {
        workplaceCount: 48,
        contractCount: 61,
        stackCount: 213,

        completedMeasurementCount: 2417,
        thisMonthMeasurementCount: 187,
        newContractCount: 4,

        // 완료일 오름차순 (서버 정렬 규칙). daysRemaining 은 항상 0 이상
        expiringContracts: [
          { contractId: 101, contractName: '2026년 상반기 자가측정', workplaceName: '대한제철 당진공장', completionDate: isoDate(3), daysRemaining: 3 },
          { contractId: 102, contractName: '2026년 정기 대기측정', workplaceName: '한빛화학 여수2공장', completionDate: isoDate(12), daysRemaining: 12 },
          { contractId: 103, contractName: '수질 자가측정 대행', workplaceName: '금호섬유 구미사업장', completionDate: isoDate(27), daysRemaining: 27 },
        ],

        // 검사 예정일 오름차순. 기한 초과 항목이 앞에 오고 daysRemaining 이 음수다.
        // 단위가 "장비-검사항목"이라 같은 장비(eq-6501)가 검사 종류별로 두 건 나온다.
        inspectionDueEquipments: [
          { equipmentId: 'eq-6501', equipmentName: '가스크로마토그래프', managementNumber: 'GC-002', inspectionType: 'CALIBRATION', inspectionTypeLabel: '교정', nextDueDate: isoDate(-8), daysRemaining: -8 },
          { equipmentId: 'eq-6502', equipmentName: '먼지 채취기', managementNumber: 'DS-014', inspectionType: 'PRECISION_INSPECTION', inspectionTypeLabel: '정도검사', nextDueDate: isoDate(0), daysRemaining: 0 },
          { equipmentId: 'eq-6501', equipmentName: '가스크로마토그래프', managementNumber: 'GC-002', inspectionType: 'PRECISION_INSPECTION', inspectionTypeLabel: '정도검사', nextDueDate: isoDate(23), daysRemaining: 23 },
          { equipmentId: 'eq-6504', equipmentName: '수은 분석기', managementNumber: 'HG-003', inspectionType: 'GENERAL_TEST', inspectionTypeLabel: '일반시험', nextDueDate: isoDate(51), daysRemaining: 51 },
        ],
      },
    });
  }),
];

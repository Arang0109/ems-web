# entities 레이어

비즈니스 도메인 타입, API 호출, 데이터 페칭 훅을 담당합니다.

---

## 책임 범위

- 순수 도메인 타입 정의 (`Company`, `Workplace` 등)
- API 호출 함수 정의 (CRUD)
- 서버 응답/요청 DTO 정의
- 데이터 페칭 훅 (`useCompanies`, `useWorkplaces` 등)

## 금지 사항

- **Form 타입 금지** — `CompanyRegisterForm` 등은 해당 feature의 `model/`에 위치
- **UI 표현 타입 금지** — `CompanyTableRow` 등은 해당 widget의 `model/`에 위치
- **mapper 함수 `model/`에 위치 금지** — mapper는 `api/`에 위치

---

## 파일 구조 표준

```
entity-name/
├── index.ts
├── api/
│   ├── api.ts        # API 호출 함수 (object 패턴)
│   └── dtos.ts       # 요청/응답 DTO 타입
└── model/
    ├── types.ts      # 순수 도메인 타입만
    └── use-xxx.ts    # 데이터 페칭 훅
```

---

## API 패턴

### `api/api.ts` — Object 패턴

```typescript
export const companyApi = {
  getCompanyList: () =>
    axiosPrivate.get<ApiResponseMessage<CompanyListResponse[]>>('/companies'),

  registerCompany: (data: CompanyRegisterRequest) =>
    axiosPrivate.post<ApiResponseMessage<Company>>('/companies', data),
};
```

### `api/dtos.ts` — 요청/응답 DTO 분리

```typescript
// 응답 DTO (서버 → 클라이언트)
export type CompanyListResponse = {
  id: number;
  name: string;
  bizNumber: string;
  // ...
};

// 요청 DTO (클라이언트 → 서버)
export type CompanyRegisterRequest = {
  name: string;
  bizNumber: string;
  // ...
};
```

응답 wrapper: `ApiResponseMessage<T>` (`@shared/model/api-types` 참조)

### `model/types.ts` — 순수 도메인 타입

```typescript
// 도메인 엔티티 (등록 후 반환 또는 조회 결과)
export type Company = {
  id: number;
  name: string;
  bizNumber: string;
  // ...
};
```

### `model/use-xxx.ts` — 데이터 페칭 훅

```typescript
export function useCompanies() {
  const [data, setData] = useState<CompanyListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => { /* ... */ };

  useEffect(() => { refetch(); }, []);

  return { data, loading, error, refetch };
}
```

---

## 알려진 위반 사항

| 위치 | 문제 | 개선 방향 |
|------|------|-----------|
| `company/model/company-form.ts` | Form 타입이 entity에 혼재 | `features/register-company/model/`로 이동 |
| `company/model/company-mapper.ts` | mapper가 `model/`에 위치 | `api/company-mapper.ts`로 이동 |
| `company/model/company-types.ts` | `WorkplaceTableCols` (UI 표현 타입) 포함 | `widgets/company-table/model/`로 분리 |

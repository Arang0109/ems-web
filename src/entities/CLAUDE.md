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

## 외부 노출 원칙

- Entity slice에서 외부 레이어로 노출할 수 있는 타입은 `model/types.ts`의 **도메인 모델 타입**만 허용한다.
- 여기에는 조회 모델뿐 아니라 등록/수정에 사용하는 도메인 입력 모델도 포함된다.


```ts
// ✅ 허용
export type { Company } from './model/types';
export type { CompanyCreate } from './model/types';
export type { CompanyUpdate } from './model/types';

// ❌ 금지
export type { CompanyCreateRequest } from './api/dto';
export type { CompanyUpdateRequest } from './api/dto';
export type { CompanyListResponse } from './api/dto';
```

---

## 파일 구조 표준

```
entity-name/
├── index.ts
├── api/
│   ├── api.ts        # API 호출 함수 (object 패턴)
│   └── dto.ts       # 요청/응답 DTO 타입
└── model/
    ├── types.ts      # 순수 도메인 타입만
    └── use-entity.ts    # 데이터 페칭 훅
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

### `api/dto.ts` — 요청/응답 DTO 분리

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

### `model/use-entity.ts` — 데이터 페칭 훅

- API DTO를 직접 UI에 노출하지 않고, 가능하면 `model/types.ts`의 도메인 타입으로 변환하여 반환한다.
- 단, DTO와 도메인 타입이 완전히 동일한 경우에는 타입 alias로 연결할 수 있다.

```typescript
export function useCompanies() {
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => { /* ... */ };

  useEffect(() => { refetch(); }, []);

  return { data, loading, error, refetch };
}
```

---

## 도메인 입력 모델 목록

각 entity에서 외부 노출 가능한 입력 모델(등록/수정용 도메인 타입)은 아래와 같습니다.

| Entity | 노출 타입 |
|--------|-----------|
| `company` | `Company`, `CompanyCreate`, `CompanyUpdate` |
| `contract` | `Contract`, `ContractListItem`, `ContractDetail`, `ContractCreate`, `ContractUpdate` |
| `workplace` | `Workplace`, `WorkplaceListItem`, `WorkplaceCreate`, `WorkplaceUpdate`, `ContractOverview` |
| `stack` | `Stack`, `StackCreate`, `StackListItem` |
| `pollutant` | `Pollutant` |
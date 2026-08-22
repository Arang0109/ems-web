/**
 * shadcn/ui 에서 이관한 저수준 UI 프리미티브.
 *
 * `shared/ui` 의 다른 슬라이스(form, table, pagination 등)가 조합해 쓰는 재료이며,
 * 비즈니스 코드에서 직접 쓰지 않는다 — 각 카테고리의 래퍼를 통해 사용할 것.
 *
 * Base UI(@base-ui/react) 를 쓰지 않는 순수 마크업 컴포넌트만 여기에 있다.
 * Base UI 위에 있는 것들(input, separator, select, dialog, sidebar 등)은
 * 아직 `src/components/ui` 에 남아 있다.
 */
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from './Field';

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from './InputGroup';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './Pagination';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './Table';

export { Calendar, CalendarDayButton } from './Calendar';
export { Label } from './Label';
export { Textarea } from './Textarea';

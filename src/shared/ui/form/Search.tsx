import { useId } from 'react';
import { SearchIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Field } from '@shared/ui/primitives';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@shared/ui/primitives"

interface SearchProps {
  value: string;
  /** 다른 입력 컨트롤과 같은 계약 — 값만 넘긴다(`setState`·TanStack `setGlobalFilter` 를 그대로 꽂을 수 있다) */
  onChange: (value: string) => void;
  placeholder?: string;
  /** 폭·정렬은 호출부가 결정한다. 미지정 시 내용 폭(최대 max-w-sm) */
  className?: string;
}

export const Search = ({
  value,
  onChange,
  placeholder = "...",
  className,
}: SearchProps) => {
  // 한 화면에 검색창이 둘 이상이어도 id 가 겹치지 않게 한다
  const id = useId();

  return (
    <Field className={cn("max-w-sm", className)}>
      <InputGroup className="bg-surface">
        <InputGroupInput
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-ink" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

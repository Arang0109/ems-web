import { type Dispatch, type SetStateAction } from 'react';
import { SearchIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Field } from '@shared/ui/primitives';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@shared/ui/primitives"

interface SearchProps {
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  placeholder?: string;
  /** 폭·정렬은 호출부가 결정한다. 미지정 시 내용 폭(최대 max-w-sm) */
  className?: string;
}

export const Search = ({
  filter,
  setFilter,
  placeholder = "...",
  className,
}: SearchProps) => {
  return (
    <Field className={cn("max-w-sm", className)}>
      <InputGroup className="bg-surface">
        <InputGroupInput
          id="inline-start-input"
          value={filter}
          onChange={(e) => setFilter(String(e.target.value))}
          placeholder={placeholder}
          />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
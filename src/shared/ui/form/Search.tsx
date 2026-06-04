import { type Dispatch, type SetStateAction } from 'react';
import { SearchIcon } from 'lucide-react';

import { Field } from '@/components/ui/field';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

interface SearchProps {
  filter: string;
  setFilter: Dispatch<SetStateAction<string>>;
  placeholder?: string;
}

export const Search = ({
  filter,
  setFilter,
  placeholder = "...",
}: SearchProps) => {
  return (
    <Field className="max-w-sm">
      <InputGroup>
        <InputGroupInput
          id="inline-start-input"
          value={filter}
          onChange={(e) => setFilter(String(e.target.value))}
          placeholder={placeholder} />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
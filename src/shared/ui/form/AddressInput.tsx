import { useKakaoPostcode } from '@clroot/react-kakao-postcode';

import { Field, FieldLabel } from '@shared/ui/primitives';
import { InputGroup, InputGroupInput, InputGroupAddon } from '@shared/ui/primitives';
import { Button } from "@shared/ui/buttons";
import type { AddressValue } from '@shared/model';

import { Hash, MapPinned, House } from 'lucide-react';

interface Props {
  id?: string;
  placeholder?: string;
  value: AddressValue;
  onChange?: (value: AddressValue) => void;
}

export const AddressInput = ({
  id,
  placeholder,
  value,
  onChange,
}: Props) => {
  const { status, error, open } = useKakaoPostcode({
    onComplete: (address) => {
      onChange?.({
        zipcode: address.zonecode,
        roadAddress: address.roadAddress,
        detailAddress: '',
      });
    },
  });

  if (status === 'error') return <p>{error?.message}</p>;

  return (
    <div className='grid gap-4'>
      <FieldLabel htmlFor={id}>
        주소
      </FieldLabel>
      <Field orientation="horizontal">
        <InputGroup className='w-40'>
          <InputGroupAddon><Hash /></InputGroupAddon>
          <InputGroupInput id="zipcode" value={value.zipcode} readOnly />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon><MapPinned /></InputGroupAddon>
          <InputGroupInput id="roadAddress" value={value.roadAddress} readOnly />
        </InputGroup>
        <Button
          type='button'
          variant="soft"
          onClick={() => open()}>
          주소 검색
        </Button>
      </Field>
      <Field orientation="horizontal">
        <InputGroup>
          <InputGroupAddon><House /></InputGroupAddon>
          <InputGroupInput
            id={id}
            value={value.detailAddress}
            onChange={(e) => onChange?.({ ...value, detailAddress: e.target.value })}
            placeholder={placeholder} />
        </InputGroup>
      </Field>
    </div>
  );
}

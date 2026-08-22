import { useKakaoPostcode } from '@clroot/react-kakao-postcode';

import { Field, FieldLabel } from '@shared/ui/primitives';
import { InputGroup } from '@shared/ui/form';
import { Button } from "@shared/ui/buttons";
import type { AddressValue } from '@shared/model';

import { Hash, MapPinned, House, Search } from 'lucide-react';

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
        <InputGroup
          id="zipcode"
          value={value.zipcode}
          startIcon={<Hash />}
          readOnly
        />
        <InputGroup
          id="roadAddress"
          value={value.roadAddress}
          startIcon={<MapPinned />}
          readOnly
        />
        <Button
          type='button'
          variant="soft"
          onClick={() => open()}
          startIcon={Search}
          >
          검색
        </Button>
      </Field>
      <Field orientation="horizontal">
        <InputGroup
          id={id}
          value={value.detailAddress}
          onChange={(e) => onChange?.({ ...value, detailAddress: e })}
          placeholder={placeholder}
          startIcon={<House />}
        />
      </Field>
    </div>
  );
}

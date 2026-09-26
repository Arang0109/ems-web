import { useId } from 'react';
import { useKakaoPostcode } from '@clroot/react-kakao-postcode';

import { Field, FieldLabel } from '@shared/ui/primitives';
import { IconButton } from "@shared/ui/buttons";
import type { AddressValue } from '@shared/model';

import { Hash, MapPinned, House, Search } from 'lucide-react';

import { InputGroup } from './InputGroup';

interface Props {
  /** 상세주소 입력의 id — 바깥 라벨이 여기로 걸린다. 미지정 시 자동 생성 */
  id?: string;
  /** 필드 라벨. 기본 `주소` */
  label?: React.ReactNode;
  placeholder?: string;
  value: AddressValue;
  onChange?: (value: AddressValue) => void;
}

export const AddressInput = ({
  id,
  label = '주소',
  placeholder,
  value,
  onChange,
}: Props) => {
  // 한 화면에 주소 입력이 둘 이상이어도(예: 본사·사업장) id 가 겹치지 않게 한다
  const baseId = useId();
  const detailId = id ?? `${baseId}-detail`;

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
      <FieldLabel htmlFor={detailId}>
        {label}
      </FieldLabel>
      <Field orientation="horizontal">
        <InputGroup
          id={`${baseId}-zipcode`}
          value={value.zipcode}
          startIcon={<Hash />}
          readOnly
        />
        <InputGroup
          id={`${baseId}-road`}
          value={value.roadAddress}
          startIcon={<MapPinned />}
          readOnly
        />
        <IconButton
          variant="soft"
          icon={<Search />}
          label="주소 검색"
          onClick={() => open()}
        />
      </Field>
      <Field orientation="horizontal">
        <InputGroup
          id={detailId}
          value={value.detailAddress}
          onChange={(e) => onChange?.({ ...value, detailAddress: e })}
          placeholder={placeholder}
          startIcon={<House />}
        />
      </Field>
    </div>
  );
}

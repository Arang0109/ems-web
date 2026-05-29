import { FieldGroup } from "@/components/ui/field"
import { Input } from "@/shared/ui/form-fields";

export const RegisterWorkplaceForm = () => {
  return(
    <FieldGroup>
      <Input
        id="name"
        label="측정대행 의뢰기관"
        value=''
        onChange={() => null}
        helperText="사업자등록증상에 기재된 상호"
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id='bizNumber'
          label='사업자등록번호'
          value=''
          onChange={() => null}
        />
        <Input
          id='ceoName'
          label='대표자'
          value=''
          onChange={() => null}
        />
      </div>
      <Input
        id='address'
        label='측정대행 의뢰기관 주소'
        value=''
        onChange={() => null}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          id='manager'
          label='측정대행 의뢰기관 담당자'
          value=''
          onChange={() => null}
        />
        <Input
          id='tell'
          label='전화번호'
          placeholder="+821"
          value=''
          onChange={() => null}
        />
      </div>
      <Input
        id='email'
        label='E-mail'
        value=''
        onChange={() => null}
      />
    </FieldGroup>
  );
}
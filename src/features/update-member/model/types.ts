export type MemberUpdateForm = {
  name: string;
  roleId: string;      // Select 값 (string)

  department: string;
  email: string;
  tel: string;
}

export const getDefaultForm = (): MemberUpdateForm => ({
  name: "",
  roleId: "",
  department: "",
  email: "",
  tel: "",
});

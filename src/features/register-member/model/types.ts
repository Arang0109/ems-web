export type MemberRegisterForm = {
  username: string;
  password: string;
  name: string;
  roleId: string;      // Select 값 (string)

  department: string;
  email: string;
  tel: string;
}

export const getDefaultForm = (): MemberRegisterForm => ({
  username: "",
  password: "",
  name: "",
  roleId: "",
  department: "",
  email: "",
  tel: "",
});

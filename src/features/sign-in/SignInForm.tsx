import { Link } from "react-router";

import { useSignIn } from "./hooks/use-sign-in";

import { InputField, Checkbox } from "@shared/ui/form-fields";
import { Button } from "@shared/ui/buttons";


export const SignInForm = () => {

  const {
    form,
    onSubmit,

    handleChange,

    isLoading
  } = useSignIn();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField
        id="username"
        name="username"
        label="Username"
        value={form.username}
        onChange={(value) => handleChange("username", value)}
        placeholder="아이디"
        autoComplete="username"
        required
      />
      <InputField
        id="password"
        name="password"
        label="Password"
        type="password"
        value={form.password}
        onChange={(value) => handleChange("password", value)}
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />
      <div className="flex gap-4">
        <Link
          to="/forgot-password"
          className="text-xs text-neutral-500 hover:text-blue-500 transition-colors"
        >
          회원가입
        </Link>
        <Link
          to="/forgot-password"
          className="text-xs text-neutral-500 hover:text-blue-500 transition-colors"
        >
          비밀번호 찾기
        </Link>
      </div>
      <Checkbox
        id="rememberedUsername"
        name="rememberedUsername"
        label="아이디 기억하기"
        checked={form.rememberedUsername}
        onChange={(checked) => handleChange("rememberedUsername", Boolean(checked))}
      />
      <Button
        label="로그인"
        width="full"
        type="submit"
        disabled={isLoading}
      />
    </form>
  )
}
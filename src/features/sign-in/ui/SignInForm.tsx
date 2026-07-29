import { useSignIn } from "../hooks/use-sign-in";

import { Input, Checkbox } from "@shared/ui/form";
import { Link } from "@shared/ui/links";
import { Button } from "@shared/ui/buttons";


export const SignInForm = () => {

  const {
    form,
    onSubmit,

    handleChange,

    isLoading, error
  } = useSignIn();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        id="username"
        name="username"
        label="아이디"
        value={form.username}
        onChange={(value) => handleChange("username", value)}
        placeholder="아이디"
        autoComplete="username"
        isInvalid={error}
      />
      <Input
        id="password"
        name="password"
        label="비밀번호"
        type="password"
        value={form.password}
        onChange={(value) => handleChange("password", value)}
        placeholder="••••••••"
        autoComplete="current-password"
        isInvalid={error}
      />
      <div className="flex gap-4">
        <Link to="/sign-up">회원가입</Link>
        <Link to="/forgot-password">비밀번호 찾기</Link>
      </div>
      <Checkbox
        id="rememberedUsername"
        name="rememberedUsername"
        label="아이디 기억하기"
        checked={form.rememberedUsername}
        onChange={(checked) => handleChange("rememberedUsername", Boolean(checked))}
      />
      <Button
        className="w-full"
        type="submit"
        disabled={isLoading}
      >
        로그인
      </Button>
    </form>
  )
}
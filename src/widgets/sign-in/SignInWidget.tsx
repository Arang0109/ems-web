import { SignInForm, SocialSignIn } from "@features/sign-in";

import { Divider } from "@shared/ui/borders";

export const SignInWidget = () => {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <header className="mb-8 text-center">
        <h1 className="text-h1 text-foreground">
          Env-Bridge
        </h1>
        <p className="mt-1 text-caption text-muted-foreground">환경측정 업무를 더 쉽고 빠르게</p>
      </header>
      <SignInForm />
      <Divider text="또는" />
      <SocialSignIn />
    </div>
  );
}

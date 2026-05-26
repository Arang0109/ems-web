import { CenteredCardLayout } from "@shared/ui/layouts";
import { SignInWidget } from "@widgets/sign-in";

export const SignInPage = () => {
  return (
    <CenteredCardLayout>
      <SignInWidget />
    </CenteredCardLayout>
  );
}
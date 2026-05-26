import { useSignOut } from "@features/sign-out";

import { Button } from "@shared/ui/buttons";

export const Dashboard = () => {

  const { logout } = useSignOut();

  return (
    <>
      <h1>Dashboard</h1>
      <Button onClick={logout} label="Sign Out" />
    </>
  )
}
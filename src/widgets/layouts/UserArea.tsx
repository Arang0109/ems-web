import { LogOut } from "lucide-react";

import { useSignOut } from "@features/sign-out";

import { Button } from "@shared/ui/buttons";

interface Props {
  user?: {
    name: string;
    field: string;
    avatarUrl?: string;
  };
}

export const UserArea = ({
  user = { name: "강민수님", field: "대기" },
}: Props) => {
  const { logout } = useSignOut();

  return (
    <div className="flex items-center gap-4 flex-shrink-0">
      <div className="w-9 h-9 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-500 text-xs font-semibold">
            {user.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
        <p className="text-xs text-gray-500">분야 : {user.field}</p>
      </div>
      <Button icon={<LogOut className="w-4 h-4" />} label="로그아웃" variant="outline" size="sm" onClick={logout} />
    </div>
  );
}
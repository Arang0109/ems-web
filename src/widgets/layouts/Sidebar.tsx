import {
  LayoutGrid, FileText, House,
  BarChart2, Users, PieChart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

import { Button } from "@shared/ui/buttons";

const SIDEBAR_ITEMS = [
  { icon: House, label: "대시보드", path: "/dashboard" },
  { icon: LayoutGrid, label: "업체/계약", path: "/sites" },
  { icon: FileText, label: "측정계획", path: "/billing" },
  { icon: BarChart2, label: "통계", path: "/statistics" },
  { icon: PieChart, label: "분석", path: "/analysis" },
  { icon: Users, label: "회원정보", path: "/members" },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside
      className={`bg-[#191a4d] text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out w-48`}
    >

      {/* Sidebar menu items */}
      <nav className="flex flex-col gap-1 px-2 py-3 flex-1">
        {SIDEBAR_ITEMS.map(({ icon: Icon, label, path }) => (
          <Button
            key={label}
            label={label}
            variant={pathname === path ? "sidebarActive" : "sidebar"}
            icon={<Icon className="w-5 h-5 flex-shrink-0" />}
            width="left"
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

    </aside>
  );
}
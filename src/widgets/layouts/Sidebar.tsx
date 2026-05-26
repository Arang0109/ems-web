import {
  LayoutGrid, FileText, House,
  BarChart2, Users, PieChart,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { icon: House, label: "대시보드" },
  { icon: LayoutGrid, label: "현장/계약" },
  { icon: FileText, label: "청구/지급" },
  { icon: BarChart2, label: "통계" },
  { icon: PieChart, label: "분석" },
  { icon: Users, label: "회원정보" },
];

export const Sidebar = () => {

  return (
    <aside
      className={`bg-[#191a4d] text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out w-48`}
    >

      {/* Sidebar menu items */}
      <nav className="flex flex-col gap-1 px-2 py-3 flex-1">
        {SIDEBAR_ITEMS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            title={label}
            className="flex items-center gap-3 w-full px-3 py-3 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm whitespace-nowrap">{label}</span>
          </button>
        ))}
      </nav>
      
    </aside>
  );
}
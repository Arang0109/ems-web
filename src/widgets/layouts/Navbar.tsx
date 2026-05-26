import { useState } from "react";

import { ChevronDown } from "lucide-react";

import { VARIANT_STYLES } from "@shared/model";

const NAV_ITEMS = [
  { label: "현장/계약", children: ["현장관리", "계약관리"] },
  { label: "청구/지급" },
  { label: "통계" },
  { label: "회원정보" },
];

export const Navbar = () => {
  const [activeNav, setActiveNav] = useState("현장/계약");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleNavClick = (label: string, hasChildren: boolean) => {
    setActiveNav(label);
    if (hasChildren) {
      setOpenDropdown(openDropdown === label ? null : label);
    } else {
      setOpenDropdown(null);
    }
  };

  return (
    <nav className="flex items-center gap-1 flex-1">
      {NAV_ITEMS.map((item) => {
        const isActive = activeNav === item.label;
        const isOpen = openDropdown === item.label;

        return (
          <div key={item.label} className="relative">
            <button
              onClick={() => handleNavClick(item.label, !!item.children)}
              className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? VARIANT_STYLES.primary
                  : VARIANT_STYLES.ghost
              }`}
            >
              {item.label}
              {item.children && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {item.children && isOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32 z-50">
                {item.children.map((child) => (
                  <button
                    key={child}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {child}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
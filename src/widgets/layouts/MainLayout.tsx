
import { Navbar } from "./Navbar";
import { UserArea } from "./UserArea";
import { Sidebar } from "./Sidebar";

import { Logo } from "@shared/ui/logo";

interface Props {
  children: React.ReactNode;
}

export const MainLayout = ({
  children,
}: Props) => {

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center h-16 bg-white border-b border-gray-200 px-6 flex-shrink-0 z-50 relative">
        <Logo />
        <Navbar />
        <UserArea />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

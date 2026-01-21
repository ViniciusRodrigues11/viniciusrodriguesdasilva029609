import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // Retorna o foco para o botão de menu quando fechar
    setTimeout(() => {
      menuButtonRef.current?.focus();
    }, 100);
  };

  // Fecha o sidebar com a tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSidebarOpen) {
        handleCloseSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      <div className="flex-1 flex flex-col h-screen lg:ml-0">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <button
            ref={menuButtonRef}
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menu de navegação"
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-navigation"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

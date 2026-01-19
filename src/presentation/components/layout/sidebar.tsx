import { Link, useLocation } from "react-router-dom";
import { Home, Users, Dog, X } from "lucide-react";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    path: "/pets",
    label: "Pets",
    icon: <Dog className="w-5 h-5" />,
  },
  {
    path: "/tutores",
    label: "Tutores",
    icon: <Users className="w-5 h-5" />,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white text-slate-900 h-screen
          lg:h-[calc(100vh-2rem)] lg:m-4 lg:rounded-xl lg:shadow-sm
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">Pet System</h1>
            </div>
            {/* Botão fechar (apenas mobile) */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 lg:overflow-hidden overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            <p>Versão 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

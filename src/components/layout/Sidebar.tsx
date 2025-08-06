import React from 'react';
import { Book, GamepadIcon, Home } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isMobileOpen = false, onClose }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'bg-[#1ea5b9]' },
    { id: 'grammar', label: 'Grammar', icon: Book, color: 'bg-[#d43241]' },
    { id: 'exercises', label: 'Exercises', icon: GamepadIcon, color: 'bg-[#ff852e]' },
  ];

  return (
    <>
      <aside
        tabIndex={0}
        aria-label="Sidebar"
        className="hidden md:flex w-24 bg-[#1ea5b9] min-h-screen flex-col items-center py-6 space-y-6"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              className={`w-16 h-16 rounded-2xl shadow-lg transition-all duration-200
                ${isActive ? `${item.color} text-white shadow-xl scale-105` : 'bg-white/20 text-white hover:bg-white/30'}
              `}
            >
              <Icon className="h-6 w-6" />
            </Button>
          );
        })}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={onClose}>
          <aside
            className="w-64 bg-[#1ea5b9] h-full p-4 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button onClick={onClose} aria-label="Close menu" className="text-white text-2xl">×</button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    onTabChange(item.id);
                    onClose?.();
                  }}
                  className={`w-full justify-start text-white text-lg ${isActive ? 'font-bold' : 'opacity-80'
                    }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </aside>
        </div>
      )}
    </>
  );
};

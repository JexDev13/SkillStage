import React from 'react';
import { Book, GamepadIcon, Home } from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'bg-[#1ea5b9]' },
    { id: 'grammar', label: 'Grammar', icon: Book, color: 'bg-[#d43241]' },
    { id: 'exercises', label: 'Exercises', icon: GamepadIcon, color: 'bg-[#ff852e]' },
  ];

  return (
    <aside 
      tabIndex={0} 
      aria-label="Sidebar" 
      className="w-24 bg-[#1ea5b9] min-h-screen flex flex-col items-center py-6 space-y-6 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-white"
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
            className={`
              w-16 h-16 rounded-2xl shadow-lg transition-all duration-200
              ${isActive 
                ? `${item.color} text-white shadow-xl scale-105` 
                : 'bg-white/20 text-white hover:bg-white/30'
              }
              ${item.id === 'grammar' && isActive ? 'rounded-r-none' : ''}
            `}
          >
            <Icon className="h-6 w-6" />
          </Button>
        );
      })}
    </aside>
  );
};
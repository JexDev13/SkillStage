import React from 'react';
import { LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onHelpClick: () => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHelpClick, onSettingsClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <img
                tabIndex={0}
                src="../img/SKILLSTAGE.svg"
                alt="SkillStage Logo"
                className="h-12"
              />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            tabIndex={0}
            variant="ghost"
            size="icon"
            onClick={onHelpClick}
            className="text-[#ff852e] hover:bg-[#ff852e]/10"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          <Button
            tabIndex={0}
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="text-[#463675] hover:bg-[#463675]/10"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <div tabIndex={0} aria-label="User" className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user?.displayName}</span>
            
          </div>
          
          <Button
            tabIndex={0}
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Settings, Volume2, VolumeX } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-[#463675]">
            <Settings className="h-6 w-6" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audio Settings */}
          <div>
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4">Audio</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-[#463675]" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-gray-600">
                    Enable audio feedback for interactions
                  </p>
                </div>
              </div>
              <Button
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleSound}
                className={soundEnabled ? "bg-[#463675] hover:bg-[#463675]/90" : ""}
              >
                {soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>

          {/* App Info */}
          <div>
            <h3 className="text-lg font-semibold text-[#1ea5b9] mb-4">About</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>English Learning Platform</strong>
              </p>
              <p className="text-sm text-gray-600">
                Version 1.0.0 - An interactive platform for learning English grammar and practicing with engaging exercises.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
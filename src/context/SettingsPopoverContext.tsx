'use client';

import React, { createContext, useContext, useState } from 'react';

interface SettingsPopoverContextType {
  isOpen: boolean;
  openSettingsPopover: () => void;
  closeSettingsPopover: () => void;
  toggleSettingsPopover: () => void;
}

const SettingsPopoverContext = createContext<SettingsPopoverContextType | undefined>(undefined);

export const useSettingsPopover = () => {
  const context = useContext(SettingsPopoverContext);
  if (context === undefined) {
    throw new Error('useSettingsPopover must be used within a SettingsPopoverProvider');
  }
  return context;
};

interface SettingsPopoverProviderProps {
  children: React.ReactNode;
}

export const SettingsPopoverProvider: React.FC<SettingsPopoverProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSettingsPopover = () => setIsOpen(true);
  const closeSettingsPopover = () => setIsOpen(false);
  const toggleSettingsPopover = () => setIsOpen(!isOpen);

  const value = {
    isOpen,
    openSettingsPopover,
    closeSettingsPopover,
    toggleSettingsPopover,
  };

  return (
    <SettingsPopoverContext.Provider value={value}>
      {children}
    </SettingsPopoverContext.Provider>
  );
}; 
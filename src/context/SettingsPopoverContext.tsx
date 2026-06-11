"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SettingsPopoverContextType {
  isOpen: boolean;
  openSettingsPopover: () => void;
  closeSettingsPopover: () => void;
  toggleSettingsPopover: () => void;
}

const SettingsPopoverContext = createContext<
  SettingsPopoverContextType | undefined
>(undefined);

export const useSettingsPopover = () => {
  const context = useContext(SettingsPopoverContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsPopover must be used within a SettingsPopoverProvider",
    );
  }
  return context;
};

interface SettingsPopoverProviderProps {
  children: React.ReactNode;
}

export const SettingsPopoverProvider: React.FC<
  SettingsPopoverProviderProps
> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSettingsPopover = useCallback(() => setIsOpen(true), []);
  const closeSettingsPopover = useCallback(() => setIsOpen(false), []);
  const toggleSettingsPopover = useCallback(
    () => setIsOpen((prev) => !prev),
    [],
  );

  const value = useMemo(
    () => ({
      isOpen,
      openSettingsPopover,
      closeSettingsPopover,
      toggleSettingsPopover,
    }),
    [isOpen, openSettingsPopover, closeSettingsPopover, toggleSettingsPopover],
  );

  return (
    <SettingsPopoverContext.Provider value={value}>
      {children}
    </SettingsPopoverContext.Provider>
  );
};

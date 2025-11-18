

import React from 'react';
import { Tab } from '../types';
import { BankIcon, ShopIcon, ScannerIcon, GamblingIcon, MapIcon } from './icons/NavIcons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavButton: React.FC<{
  label: string;
  tab: Tab;
  activeTab: Tab;
  onClick: (tab: Tab) => void;
  children: React.ReactNode;
  [key: string]: any;
}> = ({ label, tab, activeTab, onClick, children, ...rest }) => {
  const isActive = activeTab === tab;
  const activeClasses = 'text-white';
  const inactiveClasses = 'text-neutral-500 hover:text-white';

  return (
    <button
      {...rest}
      onClick={() => onClick(tab)}
      className={`flex flex-col items-center justify-center w-1/5 p-2 transition-colors duration-300 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <div className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
        {children}
      </div>
      <span className={`text-xs font-bold mt-1 transition-all duration-300 ${isActive ? 'tracking-wider' : ''}`}>
        {label}
      </span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex bg-black/80 backdrop-blur-lg border-t-2 border-neutral-800 items-center pt-2">
      <NavButton label="Bank" tab={Tab.Bank} activeTab={activeTab} onClick={setActiveTab} data-testid="bank-nav-button">
        <BankIcon />
      </NavButton>
      <NavButton label="Shop" tab={Tab.Shop} activeTab={activeTab} onClick={setActiveTab}>
        <ShopIcon />
      </NavButton>

      <div className="w-1/5 flex justify-center">
        <button
            onClick={() => setActiveTab(Tab.Spill)}
            aria-label="Spill"
            className={`w-16 h-16 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg shadow-red-600/50 border-4 border-black transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 ${activeTab === Tab.Spill ? 'scale-105 bg-red-500' : ''} -translate-y-2 hover:-translate-y-3`}
        >
            <MapIcon />
            <span className="text-xs font-bold mt-0.5">Spill</span>
        </button>
      </div>

      <NavButton label="Scanner" tab={Tab.Scanner} activeTab={activeTab} onClick={setActiveTab}>
        <ScannerIcon />
      </NavButton>
      <NavButton label="Gambling" tab={Tab.Gambling} activeTab={activeTab} onClick={setActiveTab}>
        <GamblingIcon />
      </NavButton>
    </div>
  );
};

export default BottomNav;

import React from 'react';
import { View } from '../types';
import { InventoryIcon, HistoryIcon } from './icons';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const getButtonClasses = (view: View) => {
    return currentView === view
      ? 'bg-blue-600 text-white'
      : 'bg-white text-slate-700 hover:bg-slate-100';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Office Inventory Management
        </h1>
        <nav className="flex items-center bg-slate-200 rounded-lg p-1">
          <button
            onClick={() => setView(View.INVENTORY)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${getButtonClasses(View.INVENTORY)}`}
          >
            <InventoryIcon className="h-5 w-5" />
            Inventory
          </button>
          <button
            onClick={() => setView(View.EXPORTS)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${getButtonClasses(View.EXPORTS)}`}
          >
            <HistoryIcon className="h-5 w-5" />
            Export History
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { FileText, BarChart3, Settings } from 'lucide-react';
import { ActiveTab } from '../types/journal';

interface NavbarTabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const NavbarTabs: React.FC<NavbarTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'jurnal' as ActiveTab,
      label: 'Jurnal Harian',
      icon: FileText,
      iconColor: 'text-amber-500',
    },
    {
      id: 'rekap' as ActiveTab,
      label: 'Rekap Bulanan',
      icon: BarChart3,
      iconColor: 'text-emerald-500',
    },
    {
      id: 'pengaturan' as ActiveTab,
      label: 'Pengaturan',
      icon: Settings,
      iconColor: 'text-slate-600',
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6">
        <div className="flex space-x-1 sm:space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.iconColor}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

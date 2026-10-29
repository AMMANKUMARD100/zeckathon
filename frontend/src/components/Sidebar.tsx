import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  FileSearch, 
  PieChart, 
  FlaskConical, 
  BookOpen, 
  Settings as SettingsIcon,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'goals', label: 'Goal Planner', icon: Target },
    { id: 'rag', label: 'AI Document Assistant', icon: FileSearch },
    { id: 'proposals', label: 'Portfolio Proposals', icon: PieChart },
    { id: 'suitability-lab', label: 'Suitability Lab', icon: FlaskConical },
    { id: 'documents', label: 'Document Library', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className={`bg-navy-900 text-slate-100 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} min-h-screen border-r border-slate-800`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="bg-teal-500 p-2 rounded-lg text-navy-900 font-bold text-xl flex items-center justify-center">
            FP
          </div>
          {isOpen && (
            <div>
              <div className="font-bold text-lg tracking-wide text-white">FinPilot AI</div>
              <div className="text-xs text-teal-400 font-medium">RIA Advisory Co-pilot</div>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white md:block hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
              {isOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {isOpen && (
        <div className="p-4 m-3 bg-navy-800/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
            <ShieldAlert size={16} />
            <span>SEBI Reg 17 Compliance</span>
          </div>
          <p className="leading-relaxed">
            Deterministic suitability rules active. AI output cannot override rule engine rejections.
          </p>
        </div>
      )}
    </aside>
  );
};

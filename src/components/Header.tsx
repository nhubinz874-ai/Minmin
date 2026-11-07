import React from 'react';
import { ViewMode } from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  AlertCircle, 
  Layers, 
  Search, 
  Sun, 
  Moon, 
  Type
} from 'lucide-react';
import { AppSettings } from '../utils/storage';

interface HeaderProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  wrongCount: number;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onStartExamModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  wrongCount,
  settings,
  onUpdateSettings,
  onStartExamModal,
}) => {
  const toggleDarkMode = () => {
    const newDark = !settings.darkMode;
    onUpdateSettings({ darkMode: newDark });
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const cycleFontSize = () => {
    const nextSize = settings.fontSize === 'normal' ? 'large' : settings.fontSize === 'large' ? 'xlarge' : 'normal';
    onUpdateSettings({ fontSize: nextSize });
  };

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'practice', label: 'Luyện tập', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'exam', label: 'Thi thử', icon: <Clock className="w-4 h-4" /> },
    { 
      id: 'wrong_book', 
      label: 'Sổ câu sai', 
      icon: <AlertCircle className="w-4 h-4" />,
      badge: wrongCount > 0 ? wrongCount : undefined 
    },
    { id: 'flashcards', label: 'Flashcards', icon: <Layers className="w-4 h-4" /> },
    { id: 'theory', label: 'Tra cứu & Lý thuyết', icon: <Search className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                TriếtHọc<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                BAS123
              </span>
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Quick Settings */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Font Size Adjuster */}
          <button
            onClick={cycleFontSize}
            title={`Cỡ chữ: ${settings.fontSize}`}
            aria-label="Điều chỉnh cỡ chữ"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center">
              <Type className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold ml-0.5 uppercase">
                {settings.fontSize === 'normal' ? '1x' : settings.fontSize === 'large' ? '1.2x' : '1.4x'}
              </span>
            </div>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={settings.darkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Chuyển đổi giao diện sáng/tối"
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA */}
          <button
            onClick={onStartExamModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors shadow-sm shadow-indigo-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Thi thử ngay</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center overflow-x-auto border-t border-slate-100 dark:border-slate-800 px-3 py-1.5 gap-1 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              currentView === item.id
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
            {item.badge !== undefined && (
              <span className="text-[10px] px-1 rounded-full bg-rose-500 text-white font-mono">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </header>
  );
};

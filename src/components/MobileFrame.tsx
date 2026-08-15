import React from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Home,
  Calendar,
  User as UserIcon,
  PlusCircle,
  Clock,
} from 'lucide-react';

interface MobileFrameProps {
  isMobileFrame: boolean;
  activeTab: 'services' | 'history' | 'profile';
  setActiveTab: (tab: 'services' | 'history' | 'profile') => void;
  onNewBooking: () => void;
  children: React.ReactNode;
  upcomingCount?: number;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  isMobileFrame,
  activeTab,
  setActiveTab,
  onNewBooking,
  children,
  upcomingCount = 0,
}) => {
  if (!isMobileFrame) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-6">
        {/* Desktop tab bar */}
        <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Services Administratifs</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition relative ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mes Rendez-vous</span>
              {upcomingCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                  {upcomingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Mon Profil</span>
            </button>
          </div>

          <button
            onClick={onNewBooking}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Prendre RDV</span>
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    );
  }

  // Smartphone Frame Layout (Flutter Mobile App Representation)
  return (
    <div className="flex items-center justify-center py-6 px-2 min-h-[calc(100vh-80px)] bg-slate-950/80">
      <div className="relative w-full max-w-[410px] h-[820px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 mr-2"></div>
          <div className="w-2 h-2 rounded-full bg-blue-900"></div>
        </div>

        {/* Phone Status Bar */}
        <div className="pt-2 px-6 pb-2 bg-slate-900 text-white text-xs font-medium flex items-center justify-between z-40 select-none">
          <span>09:41</span>
          <div className="flex items-center space-x-2 text-slate-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Main Phone Screen Viewport */}
        <div className="flex-1 bg-slate-50 text-slate-900 rounded-[32px] overflow-y-auto relative flex flex-col">
          {children}
        </div>

        {/* Flutter Mobile Bottom Navigation Bar */}
        <div className="mt-2 bg-slate-900 text-slate-300 rounded-b-[36px] pt-2 pb-3 px-6 flex items-center justify-around text-xs font-medium border-t border-slate-800">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex flex-col items-center space-y-1 transition ${
              activeTab === 'services' ? 'text-blue-400 font-bold scale-105' : 'hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Accueil</span>
          </button>

          <button
            onClick={onNewBooking}
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 hover:scale-105 transition">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] mt-0.5 text-blue-300 font-bold">Nouveau RDV</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center space-y-1 transition relative ${
              activeTab === 'history' ? 'text-blue-400 font-bold scale-105' : 'hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Rendez-vous</span>
            {upcomingCount > 0 && (
              <span className="absolute -top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {upcomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 transition ${
              activeTab === 'profile' ? 'text-blue-400 font-bold scale-105' : 'hover:text-white'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Profil</span>
          </button>
        </div>

        {/* Home Bar Indicator */}
        <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-1 opacity-60"></div>
      </div>
    </div>
  );
};

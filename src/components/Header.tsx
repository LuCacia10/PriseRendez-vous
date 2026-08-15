import React from 'react';
import { User } from '../types';
import {
  Building2,
  QrCode,
  Bell,
  Smartphone,
  ShieldCheck,
  Code2,
  LogOut,
  UserCheck,
  CalendarCheck,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  activeView: 'citizen' | 'agent' | 'docs';
  setActiveView: (view: 'citizen' | 'agent' | 'docs') => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  setActiveView,
  isMobileFrame,
  setIsMobileFrame,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenAuth,
  onLogout,
  onOpenDocs,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        {/* Brand & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-100">
                Rendez-vous Admin
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium border border-blue-400/30">
                v1.0 Service Public
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Mairie & Préfecture • Prise de RDV • QR Code • FCM
            </p>
          </div>
        </div>

        {/* Center Mode Switchers */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
          <button
            id="btn-view-citizen"
            onClick={() => setActiveView('citizen')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'citizen'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>App Usager</span>
          </button>

          <button
            id="btn-view-agent"
            onClick={() => setActiveView('agent')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'agent'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Guichet Agent (Scan)</span>
          </button>

          <button
            id="btn-view-docs"
            onClick={onOpenDocs}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'docs'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Livrables (SQL/Flutter)</span>
            <span className="sm:hidden">Livrables</span>
          </button>
        </div>

        {/* Right Tools & User Info */}
        <div className="flex items-center space-x-2">
          {/* Mobile frame toggle */}
          {activeView === 'citizen' && (
            <button
              id="btn-toggle-frame"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              title={isMobileFrame ? 'Passer en Mode Web' : 'Passer en Mode Smartphone'}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <Smartphone className={`w-4 h-4 ${isMobileFrame ? 'text-blue-400' : ''}`} />
            </button>
          )}

          {/* Notifications Button */}
          {currentUser && (
            <button
              id="btn-open-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Center de notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          )}

          {/* Auth Status & Account */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-slate-200">
                  {currentUser.firstName} {currentUser.fullName}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role === 'agent' ? 'Agent Guichet' : 'Usager Citoyen'}
                </p>
              </div>
              <button
                id="btn-user-logout"
                onClick={onLogout}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 transition"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-auth"
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Connexion</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { AppNotification } from '../types';
import { api } from '../lib/api';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onRefresh: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefresh,
}) => {
  if (!isOpen) return null;

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'confirmation':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'validation':
        return <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />;
      case 'annulation':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Clock className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Notifications Push (FCM)
              </h2>
              <p className="text-xs text-slate-400">
                Historique des alertes et rappels de RDV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Aucune notification reçue pour le moment.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border text-xs transition space-y-1 relative ${
                  notif.isRead
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-blue-50/50 border-blue-200 text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getNotifIcon(notif.type)}
                    <h3 className="font-bold text-slate-900 text-xs">{notif.title}</h3>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-[10px] text-blue-600 font-bold hover:underline flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Lu</span>
                    </button>
                  )}
                </div>

                <p className="text-slate-600 text-xs pl-7 leading-relaxed">
                  {notif.message}
                </p>

                <p className="text-[10px] text-slate-400 pl-7 pt-1">
                  {new Date(notif.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

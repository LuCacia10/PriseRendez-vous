import React, { useState } from 'react';
import { Appointment } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  XCircle,
  Search,
  PlusCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface AppointmentsHistoryScreenProps {
  appointments: Appointment[];
  onSelectAppointment: (appt: Appointment) => void;
  onNewBooking: () => void;
  loading: boolean;
}

export const AppointmentsHistoryScreen: React.FC<AppointmentsHistoryScreenProps> = ({
  appointments,
  onSelectAppointment,
  onNewBooking,
  loading,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'honored' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = appointments.filter((appt) => {
    const matchesSearch =
      appt.appointmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.agencyName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'upcoming') {
      return appt.status === 'confirme' || appt.status === 'en_attente';
    }
    if (filter === 'honored') {
      return appt.status === 'honore';
    }
    if (filter === 'cancelled') {
      return appt.status === 'annule';
    }
    return true;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirme':
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full">
            Confirmé
          </span>
        );
      case 'honore':
        return (
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold rounded-full">
            Honoré
          </span>
        );
      case 'annule':
        return (
          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold rounded-full">
            Annulé
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-full">
            En attente
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Title & CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Historique des rendez-vous
          </h2>
          <p className="text-xs text-slate-500">
            Consultez vos tickets et vos QR Codes de passage
          </p>
        </div>

        <button
          onClick={onNewBooking}
          className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouveau RDV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setFilter('upcoming')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition text-center whitespace-nowrap ${
            filter === 'upcoming'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          À venir
        </button>
        <button
          onClick={() => setFilter('honored')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition text-center whitespace-nowrap ${
            filter === 'honored'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Honorés
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition text-center whitespace-nowrap ${
            filter === 'cancelled'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Annulés
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl transition text-center whitespace-nowrap ${
            filter === 'all'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tous ({appointments.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un N° A-2026-..., service, agence..."
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Chargement de vos rendez-vous...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Aucun rendez-vous trouvé</p>
          <p className="text-xs text-slate-400">
            Vous n'avez aucun rendez-vous correspondant à ce filtre.
          </p>
          <button
            onClick={onNewBooking}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-block shadow"
          >
            Prendre un rendez-vous
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div
              key={appt.id}
              onClick={() => onSelectAppointment(appt)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{appt.appointmentNumber}</span>
                </span>
                {getStatusBadge(appt.status)}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900">{appt.serviceName}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{appt.agencyName}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center space-x-1 font-semibold text-blue-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{appt.slotDate} à {appt.startTime}</span>
                </span>

                <div className="flex items-center space-x-1 text-blue-600 font-bold hover:underline">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Voir QR Code</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { api } from '../lib/api';
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Share2,
  Printer,
  X,
  FileText,
  Building2,
  RefreshCw,
  BellRing,
} from 'lucide-react';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onAppointmentUpdated: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  onClose,
  onAppointmentUpdated,
}) => {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState(
    appointment ? appointment.slotDate : new Date().toISOString().split('T')[0]
  );
  const [newTime, setNewTime] = useState(appointment ? appointment.startTime : '10:00');
  const [rescheduling, setRescheduling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (appointment) {
      fetchQrCode();
    }
  }, [appointment]);

  if (!appointment) return null;

  const fetchQrCode = async () => {
    setLoadingQr(true);
    try {
      const res = await api.getQrCode(appointment.id);
      setQrCodeImage(res.qrCodeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    setCancelling(true);
    try {
      await api.cancelAppointment(appointment.id);
      setActionMessage('Rendez-vous annulé avec succès.');
      setTimeout(() => {
        onAppointmentUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = async () => {
    setRescheduling(true);
    try {
      await api.rescheduleAppointment(appointment.id, {
        slotDate: newDate,
        startTime: newTime,
        endTime: newTime,
      });
      setActionMessage('Rendez-vous reporté avec succès !');
      setTimeout(() => {
        onAppointmentUpdated();
        setShowReschedule(false);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du report');
    } finally {
      setRescheduling(false);
    }
  };

  const handleTriggerTestNotif = async (type: '24h' | '1h') => {
    try {
      await api.triggerReminder(appointment.id, type);
      alert(`Notification FCM de rappel (${type}) envoyée à l'usager !`);
      onAppointmentUpdated();
    } catch (e) {
      alert('Erreur envoi notification.');
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirme':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmé</span>
          </span>
        );
      case 'honore':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Honoré (Scanné à l'accueil)</span>
          </span>
        );
      case 'annule':
        return (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-full flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Annulé</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">
            En attente
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 my-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {actionMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-center">
            {actionMessage}
          </div>
        )}

        {/* Ticket Top Card */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-extrabold mb-2 border border-blue-200">
            <FileText className="w-3.5 h-3.5" />
            <span>Numéro de rendez-vous</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {appointment.appointmentNumber}
          </h2>
          <div className="flex justify-center mt-2">{getStatusBadge(appointment.status)}</div>
        </div>

        {/* QR Code Scannable View */}
        {appointment.status !== 'annule' && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center mb-4 relative">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              QR Code de passage (À présenter à l'accueil)
            </p>

            <div className="bg-white p-3 rounded-2xl shadow-sm inline-block border border-slate-200">
              {loadingQr ? (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                  Génération du QR Code...
                </div>
              ) : qrCodeImage ? (
                <img
                  src={qrCodeImage}
                  alt={`QR Code ${appointment.appointmentNumber}`}
                  className="w-48 h-48 mx-auto object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-rose-500">
                  Erreur de chargement du QR Code
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 mt-2">
              Validable par l'agent de guichet via caméra ou douchette QR.
            </p>
          </div>
        )}

        {/* Appointment Details List */}
        <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs mb-4">
          <div className="flex items-start space-x-2.5">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">{appointment.serviceName}</p>
              <p className="text-slate-500">{appointment.agencyName}</p>
              <p className="text-slate-400 text-[11px]">{appointment.agencyAddress}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 pt-2 border-t border-slate-100">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              Date: <strong className="text-blue-600">{appointment.slotDate}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              Horaire: <strong className="text-blue-600">{appointment.startTime} - {appointment.endTime}</strong>
            </span>
          </div>

          {appointment.validatedAt && (
            <div className="pt-2 border-t border-slate-100 text-[11px] text-blue-700 bg-blue-50/50 p-2 rounded-xl">
              <p className="font-bold">Présence validée à l'accueil</p>
              <p>Le: {new Date(appointment.validatedAt).toLocaleString('fr-FR')}</p>
              <p>Par: {appointment.validatedBy}</p>
            </div>
          )}
        </div>

        {/* Reschedule View */}
        {showReschedule ? (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs mb-4">
            <p className="font-bold text-slate-900">Reporter le rendez-vous</p>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Nouvelle date :</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Heure de début :</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full p-2 bg-white border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setShowReschedule(false)}
                className="w-1/2 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="w-1/2 py-2 bg-blue-600 text-white font-bold rounded-xl"
              >
                {rescheduling ? 'Enregistrement...' : 'Valider le report'}
              </button>
            </div>
          </div>
        ) : null}

        {/* Actions Bar */}
        <div className="space-y-2">
          {/* Notification FCM trigger test button */}
          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Tester Rappel Push FCM:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => handleTriggerTestNotif('24h')}
                className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700"
              >
                Rappel 24h
              </button>
              <button
                onClick={() => handleTriggerTestNotif('1h')}
                className="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700"
              >
                Rappel 1h
              </button>
            </div>
          </div>

          {appointment.status === 'confirme' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowReschedule(true)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Reporter</span>
              </button>

              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>{cancelling ? 'Annulation...' : 'Annuler'}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer / Télécharger la confirmation PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Service, Agency, TimeSlot, Appointment } from '../types';
import { api } from '../lib/api';
import {
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  ArrowLeft,
  Check,
  QrCode,
  ShieldAlert,
} from 'lucide-react';

interface BookingScreenProps {
  initialService: Service | null;
  services: Service[];
  agencies: Agency[];
  onBookingSuccess: (appt: Appointment) => void;
  onCancel: () => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  initialService,
  services,
  agencies,
  onBookingSuccess,
  onCancel,
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(
    initialService || services[0] || null
  );
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Filter available agencies for the chosen service
  const availableAgencies = agencies.filter((agency) =>
    selectedService ? selectedService.agencyIds.includes(agency.id) : true
  );

  useEffect(() => {
    if (availableAgencies.length > 0 && !selectedAgency) {
      setSelectedAgency(availableAgencies[0]);
    }
  }, [selectedService, availableAgencies]);

  // Fetch slots whenever service, agency, or date changes
  useEffect(() => {
    if (selectedService && selectedAgency && selectedDate) {
      fetchSlots();
    }
  }, [selectedService, selectedAgency, selectedDate]);

  const fetchSlots = async () => {
    if (!selectedService || !selectedAgency) return;
    setLoadingSlots(true);
    setBookingError(null);
    try {
      const data = await api.getSlots(
        selectedService.id,
        selectedAgency.id,
        selectedDate
      );
      setSlots(data);
    } catch (err: any) {
      setBookingError('Impossible de charger les créneaux disponibles.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedAgency || !selectedSlot) return;

    setSubmitting(true);
    setBookingError(null);

    try {
      const appt = await api.createAppointment({
        serviceId: selectedService.id,
        agencyId: selectedAgency.id,
        slotDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      onBookingSuccess(appt);
    } catch (err: any) {
      setBookingError(
        err.message || 'Ce créneau a déjà été réservé. Veuillez choisir une autre heure.'
      );
      // Refresh slots on error
      fetchSlots();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Annuler</span>
        </button>

        <h2 className="text-sm font-bold text-slate-900">
          Prise de rendez-vous (Étape {step}/3)
        </h2>
      </div>

      {/* Wizard Progress Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`h-1.5 rounded-full transition-all ${
            step >= 1 ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all ${
            step >= 2 ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        />
        <div
          className={`h-1.5 rounded-full transition-all ${
            step >= 3 ? 'bg-blue-600' : 'bg-slate-200'
          }`}
        />
      </div>

      {bookingError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* STEP 1: SERVICE & AGENCY SELECTION */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Choix du service administratif
            </label>
            <select
              value={selectedService?.id || ''}
              onChange={(e) => {
                const srv = services.find((s) => s.id === e.target.value);
                if (srv) setSelectedService(srv);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Sélection du guichet / de l'agence
            </label>
            <div className="space-y-2">
              {availableAgencies.map((agency) => (
                <div
                  key={agency.id}
                  onClick={() => setSelectedAgency(agency)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-3 ${
                    selectedAgency?.id === agency.id
                      ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building2
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      selectedAgency?.id === agency.id
                        ? 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{agency.name}</p>
                    <p className="text-slate-500 mt-0.5 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{agency.address}, {agency.postalCode} {agency.city}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Horaires: {agency.openingHours}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!selectedService || !selectedAgency}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow transition flex items-center justify-center space-x-2"
          >
            <span>Choisir une date & un créneau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: DATE & TIME SLOT SELECTION */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Sélectionner la date</span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Créneaux horaires disponibles</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Durée: {selectedService?.durationMinutes} min
              </span>
            </div>

            {loadingSlots ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Vérification des disponibilités en temps réel...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const freeSeats = slot.capacity - slot.bookedCount;
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        !slot.isAvailable
                          ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                          : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800'
                      }`}
                    >
                      <span className="text-xs font-extrabold">{slot.startTime}</span>
                      <span
                        className={`text-[10px] mt-0.5 font-medium ${
                          isSelected
                            ? 'text-blue-100'
                            : slot.isAvailable
                            ? 'text-emerald-600'
                            : 'text-rose-500'
                        }`}
                      >
                        {slot.isAvailable
                          ? `${freeSeats}/${slot.capacity} libre(s)`
                          : 'Complet'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedSlot}
              className="w-2/3 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>Vérifier le récapitulatif</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RECAP & FINAL CONFIRMATION */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">
                Récapitulatif de la réservation
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                {selectedService?.name}
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Agence / Guichet:</span>
                <strong className="text-slate-900">{selectedAgency?.name}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Adresse:</span>
                <span className="text-slate-900 text-right">{selectedAgency?.address}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Date retenue:</span>
                <strong className="text-blue-600">{selectedDate}</strong>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Créneau horaire:</span>
                <strong className="text-blue-600">{selectedSlot?.startTime} - {selectedSlot?.endTime}</strong>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold">Important pour votre visite :</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Présentez-vous 10 minutes avant l'heure fixée.</li>
                <li>Conservez le QR Code généré pour le scan à l'accueil.</li>
                <li>Apportez tous les justificatifs originaux requis.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition"
            >
              Modifier
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <span>Réservation en cours...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Confirmer mon rendez-vous</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

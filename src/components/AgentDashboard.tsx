import React, { useState, useEffect, useRef } from 'react';
import { Appointment, Agency } from '../types';
import { api } from '../lib/api';
import jsQR from 'jsqr';
import {
  ShieldCheck,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Camera,
  Calendar,
  Clock,
  User,
  Building2,
  RefreshCw,
  FileText,
  Check,
} from 'lucide-react';

interface AgentDashboardProps {
  agencies: Agency[];
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ agencies }) => {
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(
    agencies[0]?.id || 'ag-1'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Scan states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualQrInput, setManualQrInput] = useState('');
  const [scanResultMsg, setScanResultMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedAgencyId, selectedDate, statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAppointments({
        agencyId: selectedAgencyId,
        date: selectedDate,
        status: statusFilter || undefined,
      });
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Live Camera Scanner
  const startCameraScan = async () => {
    setIsCameraActive(true);
    setScanResultMsg(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err) {
      setScanResultMsg({
        type: 'error',
        text: 'Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès ou utiliser le mode manuel.',
      });
      setIsCameraActive(false);
    }
  };

  const stopCameraScan = () => {
    setIsCameraActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const tickScan = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(tickScan);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // QR Code detected!
        stopCameraScan();
        handleProcessQrData(code.data);
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(tickScan);
  };

  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQrInput.trim()) return;
    handleProcessQrData(manualQrInput.trim());
  };

  const handleProcessQrData = async (qrString: string) => {
    setScanResultMsg(null);
    try {
      const res = await api.scanQrCode(qrString);
      setSelectedAppt(res.appointment);
      setScanResultMsg({
        type: 'success',
        text: `QR Code valide ! Rendez-vous N° ${res.appointment.appointmentNumber} trouvé pour ${res.appointment.userName}.`,
      });
      fetchAppointments();
    } catch (err: any) {
      setScanResultMsg({
        type: 'error',
        text: err.message || 'QR Code non reconnu ou inexistant.',
      });
    }
  };

  const handleValidatePresence = async (apptId: string) => {
    try {
      const updated = await api.validateAppointment(
        apptId,
        'Validé à l\'accueil par l\'agent guichet.'
      );
      setSelectedAppt(updated);
      setScanResultMsg({
        type: 'success',
        text: `Présence validée pour le rendez-vous N° ${updated.appointmentNumber} !`,
      });
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Portail Guichet Agent & Contrôle d'Accès</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Scanner et Validation des Rendez-vous
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scannez les QR Codes usagers à l'arrivée pour valider le passage au guichet en temps réel.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Rafraîchir les données</span>
        </button>
      </div>

      {/* Main Grid: Left Scanner Panel / Right Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Scanner & QR Check-in Box (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Scanner de QR Code usager</span>
            </h3>

            {/* Live Camera Scanner Container */}
            <div className="bg-slate-900 rounded-2xl p-4 text-center text-white relative min-h-[220px] flex flex-col items-center justify-center overflow-hidden">
              {isCameraActive ? (
                <div className="relative w-full h-52 bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                  />
                  {/* Camera reticle frame */}
                  <div className="absolute inset-0 border-2 border-emerald-400 border-dashed m-8 rounded-xl pointer-events-none animate-pulse"></div>
                  <button
                    onClick={stopCameraScan}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shadow"
                  >
                    Fermer la caméra
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Camera className="w-12 h-12 text-slate-400 mx-auto opacity-80" />
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Scannez le QR code affiché sur l'application mobile de l'usager.
                  </p>
                  <button
                    onClick={startCameraScan}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-2 mx-auto"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activer la caméra web</span>
                  </button>
                </div>
              )}
            </div>

            {/* Manual QR string entry */}
            <form onSubmit={handleManualScanSubmit} className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Saisie manuelle du Numéro ou Payload QR :
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualQrInput}
                  onChange={(e) => setManualQrInput(e.target.value)}
                  placeholder="ex: A-2026-000121"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  Vérifier
                </button>
              </div>
            </form>

            {/* Scan Feedback Message */}
            {scanResultMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-start space-x-2 ${
                  scanResultMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {scanResultMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{scanResultMsg.text}</span>
              </div>
            )}

            {/* Scanned Appointment Card Detail */}
            {selectedAppt && (
              <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                  <span className="font-extrabold text-blue-900 text-sm">
                    N° {selectedAppt.appointmentNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      selectedAppt.status === 'honore'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {selectedAppt.status === 'honore' ? 'Déjà Honoré' : 'Confirmé'}
                  </span>
                </div>

                <div className="space-y-1 text-slate-800">
                  <p><strong>Usager:</strong> {selectedAppt.userName}</p>
                  <p><strong>Tél:</strong> {selectedAppt.userPhone}</p>
                  <p><strong>Démarche:</strong> {selectedAppt.serviceName}</p>
                  <p><strong>Créneau:</strong> {selectedAppt.slotDate} à {selectedAppt.startTime}</p>
                </div>

                {selectedAppt.status !== 'honore' ? (
                  <button
                    onClick={() => handleValidatePresence(selectedAppt.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Valider la présence au guichet</span>
                  </button>
                ) : (
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-xl text-center text-[11px] font-bold">
                    Passage au guichet déjà validé à {selectedAppt.validatedAt ? new Date(selectedAppt.validatedAt).toLocaleTimeString('fr-FR') : 'l\'accueil'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Roster Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Liste des rendez-vous du jour
              </h3>

              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />

                <select
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold max-w-[160px] truncate"
                >
                  {agencies.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Chargement des rendez-vous en cours...
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                Aucun rendez-vous programmé pour cette date ou agence.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedAppt(appt)}
                    className={`p-3.5 rounded-2xl border text-xs transition cursor-pointer flex items-center justify-between ${
                      selectedAppt?.id === appt.id
                        ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                        : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">
                          {appt.appointmentNumber}
                        </span>
                        <span className="text-slate-500 font-medium">
                          • {appt.userName}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{appt.serviceName}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-blue-600 block">{appt.startTime}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          appt.status === 'honore'
                            ? 'text-blue-600'
                            : appt.status === 'confirme'
                            ? 'text-emerald-600'
                            : 'text-rose-500'
                        }`}
                      >
                        {appt.status === 'honore'
                          ? 'Honoré'
                          : appt.status === 'confirme'
                          ? 'Confirmé'
                          : 'Annulé'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

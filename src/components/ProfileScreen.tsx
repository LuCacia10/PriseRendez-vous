import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import {
  User as UserIcon,
  Mail,
  Phone,
  CreditCard,
  Bell,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Smartphone,
} from 'lucide-react';

interface ProfileScreenProps {
  currentUser: User;
  onLogout: () => void;
  onUserUpdated: (user: User) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onLogout,
  onUserUpdated,
}) => {
  const [fcmToken, setFcmToken] = useState(
    currentUser.fcmToken || 'fcm_token_device_demo_2026'
  );
  const [tokenSaved, setTokenSaved] = useState(false);

  const handleUpdateToken = async () => {
    try {
      await api.updateFcmToken(fcmToken);
      setTokenSaved(true);
      setTimeout(() => setTokenSaved(false), 2000);
    } catch (e) {
      alert('Erreur lors de la mise à jour du token FCM');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Profile Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-extrabold text-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          {currentUser.firstName[0]}
          {currentUser.fullName[0]}
        </div>

        <h2 className="text-base font-bold text-slate-900">
          {currentUser.firstName} {currentUser.fullName}
        </h2>
        <p className="text-xs text-slate-500">{currentUser.email}</p>

        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-full border border-blue-200">
          {currentUser.role === 'agent' ? 'Agent de Guichet' : 'Compte Usager Citoyen'}
        </span>
      </div>

      {/* Account Info Details */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
          Coordonnées de l'usager
        </h3>

        <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl">
          <Phone className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 block">Numéro de Téléphone</span>
            <span className="font-semibold text-slate-800">{currentUser.phone}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl">
          <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 block">Pièce d'Identité enregistrée</span>
            <span className="font-semibold text-slate-800">
              {currentUser.identityCardNum || 'Non renseignée'}
            </span>
          </div>
        </div>
      </div>

      {/* FCM Push Token Simulator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-900 font-bold">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span>Firebase Cloud Messaging (FCM) Token</span>
        </div>

        <p className="text-slate-500 text-[11px]">
          Ce jeton permet au serveur de déclencher l'envoi direct de notifications push sur votre appareil.
        </p>

        <div className="space-y-2">
          <input
            type="text"
            value={fcmToken}
            onChange={(e) => setFcmToken(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
          />

          <button
            onClick={handleUpdateToken}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{tokenSaved ? 'Token Enregistré !' : 'Enregistrer le Token FCM'}</span>
          </button>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-2xl transition flex items-center justify-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Se déconnecter de la session</span>
      </button>
    </div>
  );
};

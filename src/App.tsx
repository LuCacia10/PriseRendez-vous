import React, { useState, useEffect } from 'react';
import { User, Service, Agency, Appointment, AppNotification } from './types';
import { api, getStoredToken, setStoredToken } from './lib/api';
import { Header } from './components/Header';
import { MobileFrame } from './components/MobileFrame';
import { AuthModal } from './components/AuthModal';
import { ServiceListScreen } from './components/ServiceListScreen';
import { BookingScreen } from './components/BookingScreen';
import { AppointmentsHistoryScreen } from './components/AppointmentsHistoryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AppointmentDetailModal } from './components/AppointmentDetailModal';
import { NotificationCenter } from './components/NotificationCenter';
import { AgentDashboard } from './components/AgentDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Navigation & Frame
  const [activeView, setActiveView] = useState<'citizen' | 'agent'>('citizen');
  const [activeTab, setActiveTab] = useState<'services' | 'history' | 'profile'>('services');
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Modals & Flows
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    try {
      // Fetch catalog data
      const [srvData, agData] = await Promise.all([
        api.getServices(),
        api.getAgencies(),
      ]);
      setServices(srvData);
      setAgencies(agData);

      // Check stored token
      const token = getStoredToken();
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
          loadUserData();
        } catch (e) {
          // Token expired
          setStoredToken(null);
        }
      }
    } catch (err) {
      console.error('Erreur initialisation app', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [appts, notifs] = await Promise.all([
        api.getMyAppointments(),
        api.getNotifications(),
      ]);
      setAppointments(appts);
      setNotifications(notifs);
    } catch (e) {
      console.error('Erreur chargement données usager', e);
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setCurrentUser(null);
    setAppointments([]);
    setNotifications([]);
    setIsBookingMode(false);
    setSelectedAppointment(null);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    loadUserData();
    if (user.role === 'agent') {
      setActiveView('agent');
    }
  };

  const handleStartBooking = (service?: Service) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setBookingService(service || services[0] || null);
    setIsBookingMode(true);
  };

  const handleBookingSuccess = (appt: Appointment) => {
    setIsBookingMode(false);
    loadUserData();
    setSelectedAppointment(appt);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const upcomingCount = appointments.filter(
    (a) => a.status === 'confirme' || a.status === 'en_attente'
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeView === 'agent' ? (
          <AgentDashboard agencies={agencies} />
        ) : (
          <MobileFrame
            isMobileFrame={isMobileFrame}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setIsBookingMode(false);
              setActiveTab(tab);
            }}
            onNewBooking={() => handleStartBooking()}
            upcomingCount={upcomingCount}
          >
            {isBookingMode ? (
              <BookingScreen
                initialService={bookingService}
                services={services}
                agencies={agencies}
                onBookingSuccess={handleBookingSuccess}
                onCancel={() => setIsBookingMode(false)}
              />
            ) : (
              <>
                {activeTab === 'services' && (
                  <ServiceListScreen
                    services={services}
                    onSelectServiceToBook={(srv) => handleStartBooking(srv)}
                  />
                )}

                {activeTab === 'history' && (
                  <AppointmentsHistoryScreen
                    appointments={appointments}
                    onSelectAppointment={(appt) => setSelectedAppointment(appt)}
                    onNewBooking={() => handleStartBooking()}
                    loading={loading}
                  />
                )}

                {activeTab === 'profile' && (
                  currentUser ? (
                    <ProfileScreen
                      currentUser={currentUser}
                      onLogout={handleLogout}
                      onUserUpdated={(u) => setCurrentUser(u)}
                    />
                  ) : (
                    <div className="p-8 text-center space-y-4">
                      <p className="text-xs text-slate-500">
                        Vous devez être connecté pour afficher votre profil.
                      </p>
                      <button
                        onClick={() => setIsAuthOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
                      >
                        Se connecter
                      </button>
                    </div>
                  )
                )}
              </>
            )}
          </MobileFrame>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Appointment Detail & Scannable QR Code Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onAppointmentUpdated={loadUserData}
      />

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onRefresh={loadUserData}
      />
    </div>
  );
}

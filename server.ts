import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import {
  User,
  Agency,
  Service,
  TimeSlot,
  Appointment,
  AppNotification,
  AdminStats,
} from './src/types';
import { mysqlSchema, sqliteSchema } from './src/lib/sqlData';
import { flutterCodebase } from './src/lib/flutterData';

const JWT_SECRET = process.env.JWT_SECRET || 'rendezvous_admin_jwt_secret_key_2026';
const PORT = 3000;

const app = express();
app.use(express.json());

// In-Memory Database Store (Emulating MySQL tables)
interface DbStore {
  users: User[];
  userPasswords: Record<string, string>; // userId -> password_hash
  agencies: Agency[];
  services: Service[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  notifications: AppNotification[];
  appointmentCounter: number;
}

const db: DbStore = {
  users: [],
  userPasswords: {},
  agencies: [],
  services: [],
  timeSlots: [],
  appointments: [],
  notifications: [],
  appointmentCounter: 124,
};

// Seed Database with Initial Administrative Data
function seedDatabase() {
  // Pre-seed Agencies
  db.agencies = [
    {
      id: 'ag-1',
      name: 'Mairie Centrale - Hôtel de Ville',
      address: '1 Place de la République',
      city: 'Paris',
      postalCode: '75001',
      phone: '01 42 68 00 00',
      openingHours: 'Du Lundi au Vendredi: 08h30 - 17h30, Samedi: 09h00 - 12h00',
    },
    {
      id: 'ag-2',
      name: 'Préfecture de Police - Service Usagers',
      address: '9 Boulevard du Palais',
      city: 'Paris',
      postalCode: '75004',
      phone: '01 53 71 53 71',
      openingHours: 'Du Lundi au Vendredi: 08h30 - 16h30',
    },
    {
      id: 'ag-3',
      name: 'Maison des Services Publics Nord',
      address: '45 Avenue de la Liberté',
      city: 'Paris',
      postalCode: '75018',
      phone: '01 40 05 18 18',
      openingHours: 'Du Lundi au Vendredi: 09h00 - 18h00',
    },
  ];

  // Pre-seed Services
  db.services = [
    {
      id: 'srv-1',
      name: 'Carte Nationale d\'Identité (CNI)',
      category: 'Identité & Passeport',
      description: 'Demande ou renouvellement de Carte Nationale d\'Identité française.',
      requiredDocuments: [
        'Ancienne carte d\'identité ou déclaration de perte/vol',
        'Justificatif de domicile de moins de 3 mois (Facture électricité, eau, avis d\'imposition)',
        '1 Photo d\'identité récente aux normes ANTS (-6 mois)',
        'Pré-demande en ligne imprimée ou numéro de pré-demande ANTS',
      ],
      durationMinutes: 15,
      maxSlotsPerTime: 4,
      agencyIds: ['ag-1', 'ag-2', 'ag-3'],
      iconName: 'CreditCard',
    },
    {
      id: 'srv-2',
      name: 'Passeport Biométrique',
      category: 'Identité & Passeport',
      description: 'Création, renouvellement ou urgence pour un passeport biométrique.',
      requiredDocuments: [
        'Ancien passeport ou CNI originale',
        'Timbre fiscal (86€ adulte, 42€ 15-17ans, 17€ <15ans)',
        'Justificatif de domicile de moins de 3 mois',
        '1 Photo d\'identité récente aux normes ANTS',
        'Numéro de pré-demande ANTS',
      ],
      durationMinutes: 20,
      maxSlotsPerTime: 3,
      agencyIds: ['ag-1', 'ag-2'],
      iconName: 'BookOpen',
    },
    {
      id: 'srv-3',
      name: 'Actes d\'État Civil',
      category: 'État Civil & Famille',
      description: 'Délivrance de copie intégrale ou extrait d\'acte de naissance, mariage ou décès.',
      requiredDocuments: [
        'Pièce d\'identité du demandeur',
        'Livret de famille ou preuve de filiation directe',
        'Justificatif de domicile',
      ],
      durationMinutes: 10,
      maxSlotsPerTime: 5,
      agencyIds: ['ag-1', 'ag-3'],
      iconName: 'FileText',
    },
    {
      id: 'srv-4',
      name: 'Permis de Conduire & Immatriculation',
      category: 'Transports & Titres',
      description: 'Demande de titre de conduite, échange de permis étranger ou duplicata.',
      requiredDocuments: [
        'Pièce d\'identité valide',
        'Code e-photo numérique avec signature',
        'Justificatif de domicile récent',
        'Avis médical (pour catégories lourdes ou renouvellement spécifique)',
      ],
      durationMinutes: 15,
      maxSlotsPerTime: 3,
      agencyIds: ['ag-2', 'ag-3'],
      iconName: 'Car',
    },
    {
      id: 'srv-5',
      name: 'Titre de Séjour & Visas',
      category: 'Étrangers & Titres',
      description: 'Première demande, renouvellement de carte de séjour ou changement de statut.',
      requiredDocuments: [
        'Passeport en cours de validité avec visa d\'entrée',
        'Acte de naissance traduit en français',
        'Justificatif de domicile récent',
        '3 Photos d\'identité récentes aux normes',
        'Justificatifs de ressources ou de présence en France',
      ],
      durationMinutes: 30,
      maxSlotsPerTime: 2,
      agencyIds: ['ag-2'],
      iconName: 'Passport',
    },
    {
      id: 'srv-6',
      name: 'Attestation d\'Accueil & Légalisations',
      category: 'Citoyenneté & Accueil',
      description: 'Validation d\'attestation d\'accueil pour visite privée ou légalisation de signature.',
      requiredDocuments: [
        'Pièce d\'identité ou titre de séjour de l\'hébergeant',
        'Titre de propriété ou bail locatif avec justificatif de domicile',
        'Dernier avis d\'imposition et 3 derniers bulletins de paie',
        'Timbre fiscal de 30€ par attestation',
        'Renseignements sur l\'hébergé (Numéro de passeport, dates de séjour)',
      ],
      durationMinutes: 20,
      maxSlotsPerTime: 3,
      agencyIds: ['ag-1', 'ag-3'],
      iconName: 'Home',
    },
  ];

  // Pre-seed Demo Users
  const citizenPasswordHash = bcrypt.hashSync('password123', 10);
  const agentPasswordHash = bcrypt.hashSync('password123', 10);
  const adminPasswordHash = bcrypt.hashSync('password123', 10);

  const citizenUser: User = {
    id: 'usr-citizen-1',
    email: 'usager@admin.fr',
    fullName: 'Dupont',
    firstName: 'Jean',
    phone: '06 12 34 56 78',
    identityCardNum: '123456789012',
    role: 'citizen',
    fcmToken: 'fcm_token_demo_citizen_device_9988',
    createdAt: new Date().toISOString(),
  };

  const agentUser: User = {
    id: 'usr-agent-1',
    email: 'agent@admin.fr',
    fullName: 'Martin',
    firstName: 'Sophie (Agent Guichet)',
    phone: '01 42 68 00 12',
    role: 'agent',
    createdAt: new Date().toISOString(),
  };

  const adminUser: User = {
    id: 'usr-admin-1',
    email: 'admin@admin.fr',
    fullName: 'Directrice',
    firstName: 'Valérie (Responsable Admin)',
    phone: '01 42 68 00 99',
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  db.users.push(citizenUser, agentUser, adminUser);
  db.userPasswords[citizenUser.id] = citizenPasswordHash;
  db.userPasswords[agentUser.id] = agentPasswordHash;
  db.userPasswords[adminUser.id] = adminPasswordHash;

  // Pre-seed Sample Appointments
  const today = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split('T')[0];

  const appt1Id = 'appt-1001';
  const appt1Num = 'A-2026-000121';
  const qrData1 = JSON.stringify({
    appointmentId: appt1Id,
    appointmentNumber: appt1Num,
    userId: citizenUser.id,
    userName: `${citizenUser.firstName} ${citizenUser.fullName}`,
    serviceId: 'srv-1',
    slotDate: tomorrow,
    startTime: '10:00',
  });

  // Generate QR base64 code for appt 1 synchronously
  let qrCodeImg1 = '';
  try {
    qrCodeImg1 = QRCode.toDataURL(qrData1) as unknown as string;
  } catch (e) {
    qrCodeImg1 = '';
  }

  const appt1: Appointment = {
    id: appt1Id,
    appointmentNumber: appt1Num,
    userId: citizenUser.id,
    userName: `${citizenUser.firstName} ${citizenUser.fullName}`,
    userEmail: citizenUser.email,
    userPhone: citizenUser.phone,
    serviceId: 'srv-1',
    serviceName: 'Carte Nationale d\'Identité (CNI)',
    agencyId: 'ag-1',
    agencyName: 'Mairie Centrale - Hôtel de Ville',
    agencyAddress: '1 Place de la République, 75001 Paris',
    slotDate: tomorrow,
    startTime: '10:00',
    endTime: '10:15',
    status: 'confirme',
    qrCodeData: qrData1,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  };

  db.appointments.push(appt1);

  // Pre-seed Notifications for citizen
  db.notifications.push({
    id: 'notif-1',
    userId: citizenUser.id,
    title: 'Rendez-vous confirmé !',
    message: `Votre rendez-vous pour "Carte Nationale d'Identité (CNI)" est confirmé pour le ${tomorrow} à 10:00 (N° ${appt1Num}).`,
    type: 'confirmation',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    appointmentId: appt1Id,
  });
}

seedDatabase();

// Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
}

function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Token invalide ou expiré.' });
      return;
    }
    const user = db.users.find((u) => u.id === (decoded as any).userId);
    if (!user) {
      res.status(401).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    req.user = user;
    next();
  });
}

function requireAgent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'agent') {
    res.status(403).json({ error: 'Accès réservé aux agents administratifs.' });
    return;
  }
  next();
}

// REST API ROUTES

// 1. AUTHENTICATION & PROFILE
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, firstName, phone, identityCardNum } = req.body;

    if (!email || !password || !fullName || !firstName || !phone) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires.' });
    }

    const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé par un autre compte.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      fullName,
      firstName,
      phone,
      identityCardNum: identityCardNum || '',
      role: 'citizen',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.userPasswords[newUser.id] = passwordHash;

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Veuillez fournir un email et un mot de passe.' });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const storedHash = db.userPasswords[user.id];
    const passwordValid = await bcrypt.compare(password, storedHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json(req.user);
});

app.post('/api/auth/fcm-token', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { fcmToken } = req.body;
  if (req.user) {
    req.user.fcmToken = fcmToken;
  }
  res.json({ success: true, message: 'Token FCM mis à jour.' });
});

// 2. SERVICES & AGENCIES CATALOG
app.get('/api/services', (_req: Request, res: Response) => {
  res.json(db.services);
});

app.get('/api/agencies', (_req: Request, res: Response) => {
  res.json(db.agencies);
});

// Helper to generate dynamic time slots for a given service, agency, and date
app.get('/api/services/:id/slots', (req: Request, res: Response) => {
  const serviceId = req.params.id;
  const { agencyId, date } = req.query as { agencyId?: string; date?: string };

  const service = db.services.find((s) => s.id === serviceId);
  if (!service) {
    return res.status(404).json({ error: 'Service introuvable.' });
  }

  const selectedAgencyId = agencyId || service.agencyIds[0];
  const slotDate = date || new Date().toISOString().split('T')[0];

  // Define business hours time slots e.g. 09:00 to 16:30
  const hours = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const slots: TimeSlot[] = hours.map((timeStr) => {
    // Calculate end time
    const [h, m] = timeStr.split(':').map(Number);
    const endTotalMinutes = h * 60 + m + service.durationMinutes;
    const endH = Math.floor(endTotalMinutes / 60).toString().padStart(2, '0');
    const endM = (endTotalMinutes % 60).toString().padStart(2, '0');
    const endTimeStr = `${endH}:${endM}`;

    // Count existing active appointments for this slot
    const existingBookedCount = db.appointments.filter(
      (a) =>
        a.serviceId === serviceId &&
        a.agencyId === selectedAgencyId &&
        a.slotDate === slotDate &&
        a.startTime === timeStr &&
        ['en_attente', 'confirme', 'honore'].includes(a.status)
    ).length;

    const capacity = service.maxSlotsPerTime;
    const bookedCount = existingBookedCount;
    const isAvailable = bookedCount < capacity;

    return {
      id: `slot-${serviceId}-${selectedAgencyId}-${slotDate}-${timeStr.replace(':', '')}`,
      serviceId,
      agencyId: selectedAgencyId,
      slotDate,
      startTime: timeStr,
      endTime: endTimeStr,
      capacity,
      bookedCount,
      isAvailable,
    };
  });

  res.json(slots);
});

// 3. APPOINTMENTS (BOOKING, CANCEL, RESCHEDULE, QR CODE)
app.post('/api/appointments', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceId, agencyId, slotDate, startTime, endTime } = req.body;
    const user = req.user!;

    if (!serviceId || !agencyId || !slotDate || !startTime) {
      return res.status(400).json({ error: 'Données de réservation incomplètes.' });
    }

    const service = db.services.find((s) => s.id === serviceId);
    const agency = db.agencies.find((a) => a.id === agencyId);

    if (!service || !agency) {
      return res.status(400).json({ error: 'Service ou agence invalide.' });
    }

    // Atomic Lock Check to prevent double booking
    const existingBookings = db.appointments.filter(
      (a) =>
        a.serviceId === serviceId &&
        a.agencyId === agencyId &&
        a.slotDate === slotDate &&
        a.startTime === startTime &&
        ['en_attente', 'confirme', 'honore'].includes(a.status)
    );

    if (existingBookings.length >= service.maxSlotsPerTime) {
      return res.status(409).json({
        error: 'Ce créneau horaire vient d\'être réservé par un autre usager. Veuillez en choisir un autre.',
      });
    }

    // Generate unique appointment number format A-2026-000125
    db.appointmentCounter += 1;
    const paddedNum = db.appointmentCounter.toString().padStart(6, '0');
    const appointmentNumber = `A-2026-${paddedNum}`;
    const appointmentId = `appt-${Date.now()}`;

    // Payload for QR Code
    const qrPayload = JSON.stringify({
      appointmentId,
      appointmentNumber,
      userId: user.id,
      userName: `${user.firstName} ${user.fullName}`,
      serviceId,
      serviceName: service.name,
      agencyName: agency.name,
      slotDate,
      startTime,
    });

    const newAppointment: Appointment = {
      id: appointmentId,
      appointmentNumber,
      userId: user.id,
      userName: `${user.firstName} ${user.fullName}`,
      userEmail: user.email,
      userPhone: user.phone,
      serviceId,
      serviceName: service.name,
      agencyId,
      agencyName: agency.name,
      agencyAddress: `${agency.address}, ${agency.postalCode} ${agency.city}`,
      slotDate,
      startTime,
      endTime: endTime || startTime,
      status: 'confirme',
      qrCodeData: qrPayload,
      createdAt: new Date().toISOString(),
    };

    db.appointments.push(newAppointment);

    // Create Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: user.id,
      title: 'Rendez-vous confirmé !',
      message: `Votre rendez-vous pour "${service.name}" à l'agence "${agency.name}" est réservé pour le ${slotDate} à ${startTime}. N°: ${appointmentNumber}`,
      type: 'confirmation',
      isRead: false,
      createdAt: new Date().toISOString(),
      appointmentId,
    };
    db.notifications.push(notif);

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la réservation.' });
  }
});

app.get('/api/appointments/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userAppts = db.appointments
    .filter((a) => a.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userAppts);
});

app.get('/api/appointments/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }

  // Ensure user owns appointment or is agent
  if (appt.userId !== req.user!.id && req.user!.role !== 'agent') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  res.json(appt);
});

app.patch('/api/appointments/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }

  if (appt.userId !== req.user!.id && req.user!.role !== 'agent') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  if (appt.status === 'annule') {
    return res.status(400).json({ error: 'Ce rendez-vous est déjà annulé.' });
  }

  appt.status = 'annule';

  // Create notification
  const notif: AppNotification = {
    id: `notif-${Date.now()}`,
    userId: appt.userId,
    title: 'Rendez-vous annulé',
    message: `Le rendez-vous N° ${appt.appointmentNumber} pour "${appt.serviceName}" a été annulé avec succès.`,
    type: 'annulation',
    isRead: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  };
  db.notifications.push(notif);

  res.json(appt);
});

app.patch('/api/appointments/:id/reschedule', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { slotDate, startTime, endTime } = req.body;
  const appt = db.appointments.find((a) => a.id === req.params.id);

  if (!appt) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }

  if (appt.userId !== req.user!.id && req.user!.role !== 'agent') {
    return res.status(403).json({ error: 'Accès non autorisé.' });
  }

  appt.slotDate = slotDate;
  appt.startTime = startTime;
  appt.endTime = endTime || startTime;
  appt.status = 'confirme';

  const notif: AppNotification = {
    id: `notif-${Date.now()}`,
    userId: appt.userId,
    title: 'Rendez-vous reporté',
    message: `Votre rendez-vous N° ${appt.appointmentNumber} a été déplacé au ${slotDate} à ${startTime}.`,
    type: 'modification',
    isRead: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  };
  db.notifications.push(notif);

  res.json(appt);
});

app.get('/api/appointments/:id/qrcode', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }

  try {
    const qrImageBase64 = await QRCode.toDataURL(appt.qrCodeData);
    res.json({
      qrCodeData: qrImageBase64,
      appointmentNumber: appt.appointmentNumber,
      rawPayload: appt.qrCodeData,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la génération du QR Code.' });
  }
});

// 4. AGENT COUNTER & RECEPTION VALIDATION
app.post('/api/appointments/:id/validate', authenticateToken, requireAgent, (req: AuthenticatedRequest, res: Response) => {
  const appt = db.appointments.find((a) => a.id === req.params.id);
  if (!appt) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }

  if (appt.status === 'honore') {
    return res.status(400).json({ error: 'Ce rendez-vous a déjà été validé à l\'accueil.' });
  }

  appt.status = 'honore';
  appt.validatedAt = new Date().toISOString();
  appt.validatedBy = req.user?.fullName || 'Agent Guichet';
  if (req.body.notes) {
    appt.notes = req.body.notes;
  }

  // Create notification for citizen
  const notif: AppNotification = {
    id: `notif-${Date.now()}`,
    userId: appt.userId,
    title: 'Présence validée à l\'accueil !',
    message: `Votre passage au guichet pour le rendez-vous N° ${appt.appointmentNumber} a été validé par l'agent d'accueil.`,
    type: 'validation',
    isRead: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  };
  db.notifications.push(notif);

  res.json(appt);
});

app.post('/api/admin/scan-qr', authenticateToken, requireAgent, async (req: AuthenticatedRequest, res: Response) => {
  const { qrPayload } = req.body;
  if (!qrPayload) {
    return res.status(400).json({ error: 'Payload QR code manquant.' });
  }

  let parsed: any;
  try {
    parsed = typeof qrPayload === 'string' ? JSON.parse(qrPayload) : qrPayload;
  } catch (e) {
    // Try matching by appointment number or ID if plain string
    const matchAppt = db.appointments.find(
      (a) => a.appointmentNumber === qrPayload || a.id === qrPayload
    );
    if (matchAppt) {
      return res.json({ appointment: matchAppt, message: 'Rendez-vous trouvé.' });
    }
    return res.status(400).json({ error: 'Format du QR Code invalide.' });
  }

  const appt = db.appointments.find(
    (a) => a.id === parsed.appointmentId || a.appointmentNumber === parsed.appointmentNumber
  );

  if (!appt) {
    return res.status(404).json({ error: 'Aucun rendez-vous correspondant à ce QR Code n\'a été trouvé.' });
  }

  res.json({
    appointment: appt,
    message: 'QR Code scanné et décodé avec succès !',
  });
});

app.get('/api/admin/appointments', authenticateToken, requireAgent, (req: Request, res: Response) => {
  const { date, status, agencyId } = req.query as {
    date?: string;
    status?: string;
    agencyId?: string;
  };

  let list = [...db.appointments];

  if (date) {
    list = list.filter((a) => a.slotDate === date);
  }
  if (status) {
    list = list.filter((a) => a.status === status);
  }
  if (agencyId) {
    list = list.filter((a) => a.agencyId === agencyId);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.post('/api/appointments/:id/trigger-reminder', authenticateToken, (req: Request, res: Response) => {
  const { type } = req.body; // '24h' | '1h'
  const appt = db.appointments.find((a) => a.id === req.params.id);

  if (!appt) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }

  const title = type === '24h' ? 'Rappel: Rendez-vous demain !' : 'Rappel: Rendez-vous dans 1 heure !';
  const msg = `N'oubliez pas votre rendez-vous pour "${appt.serviceName}" le ${appt.slotDate} à ${appt.startTime} à l'agence ${appt.agencyName}. N° ${appt.appointmentNumber}`;

  const notif: AppNotification = {
    id: `notif-${Date.now()}`,
    userId: appt.userId,
    title,
    message: msg,
    type: type === '24h' ? 'rappel_24h' : 'rappel_1h',
    isRead: false,
    createdAt: new Date().toISOString(),
    appointmentId: appt.id,
  };
  db.notifications.push(notif);

  res.json({ success: true, notification: notif });
});

// 5. NOTIFICATIONS
app.get('/api/notifications/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const list = db.notifications
    .filter((n) => n.userId === req.user!.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.patch('/api/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === req.user!.id);
  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true });
});

// 6. ADMIN MANAGEMENT & STATISTICS
app.get('/api/admin/stats', authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
  const total = db.appointments.length;
  const confirmed = db.appointments.filter((a) => a.status === 'confirme' || a.status === 'en_attente').length;
  const honored = db.appointments.filter((a) => a.status === 'honore').length;
  const cancelled = db.appointments.filter((a) => a.status === 'annule' || a.status === 'absent').length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayCount = db.appointments.filter((a) => a.slotDate === today).length;
  
  const totalCompletedOrCancelled = honored + cancelled;
  const attendanceRate = totalCompletedOrCancelled > 0 ? Math.round((honored / totalCompletedOrCancelled) * 100) : 95;

  // Breakdown by Service
  const serviceDistribution = db.services.map((srv) => {
    const count = db.appointments.filter((a) => a.serviceId === srv.id).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { name: srv.name, count, percentage };
  });

  const hourlyActivity = [
    { hour: '08:30', count: db.appointments.filter((a) => a.startTime === '08:30').length },
    { hour: '09:30', count: db.appointments.filter((a) => a.startTime === '09:30').length },
    { hour: '10:00', count: db.appointments.filter((a) => a.startTime === '10:00').length },
    { hour: '11:00', count: db.appointments.filter((a) => a.startTime === '11:00').length },
    { hour: '14:00', count: db.appointments.filter((a) => a.startTime === '14:00').length },
    { hour: '15:30', count: db.appointments.filter((a) => a.startTime === '15:30').length },
    { hour: '16:30', count: db.appointments.filter((a) => a.startTime === '16:30').length },
  ];

  const stats: AdminStats = {
    totalAppointments: total,
    confirmedCount: confirmed,
    honoredCount: honored,
    cancelledCount: cancelled,
    todayCount,
    totalUsers: db.users.length,
    totalServices: db.services.length,
    attendanceRate,
    serviceDistribution,
    hourlyActivity,
  };

  res.json(stats);
});

// Admin Service CRUD
app.post('/api/services', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { name, category, description, requiredDocuments, durationMinutes, maxSlotsPerTime, agencyIds } = req.body;
  if (!name || !category || !description) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  const newService: Service = {
    id: `srv-${Date.now()}`,
    name,
    category,
    description,
    requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : ['Pièce d\'identité'],
    durationMinutes: Number(durationMinutes) || 15,
    maxSlotsPerTime: Number(maxSlotsPerTime) || 3,
    agencyIds: Array.isArray(agencyIds) && agencyIds.length > 0 ? agencyIds : ['ag-1', 'ag-2', 'ag-3'],
    iconName: 'FileText',
  };

  db.services.push(newService);
  res.status(201).json(newService);
});

app.put('/api/services/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const index = db.services.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service introuvable.' });
  }

  db.services[index] = {
    ...db.services[index],
    ...req.body,
  };

  res.json(db.services[index]);
});

app.delete('/api/services/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const index = db.services.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service introuvable.' });
  }

  db.services.splice(index, 1);
  res.json({ success: true, message: 'Service supprimé avec succès.' });
});

app.delete('/api/appointments/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const index = db.appointments.findIndex((a) => a.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  }

  db.appointments.splice(index, 1);
  res.json({ success: true, message: 'Rendez-vous supprimé.' });
});

// 7. DELIVERABLES EXPORTS (MYSQL & FLUTTER)
app.get('/api/export/BDD.sql', (_req: Request, res: Response) => {
  res.json({ sql: mysqlSchema });
});

app.get('/api/export/schema.sql', (_req: Request, res: Response) => {
  res.json({ sql: mysqlSchema });
});

app.get('/api/export/schema.mysql.sql', (_req: Request, res: Response) => {
  res.json({ sql: mysqlSchema });
});

app.get('/api/export/schema.sqlite.sql', (_req: Request, res: Response) => {
  res.json({ sql: sqliteSchema });
});

app.get('/api/export/flutter-code', (_req: Request, res: Response) => {
  res.json({ files: flutterCodebase });
});

// START SERVER / VITE MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Express running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

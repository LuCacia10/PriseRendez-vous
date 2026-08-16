export const UML_USE_CASE_IMAGE = '/src/assets/images/uml_usecase_fr_1786882506065.jpg';
export const UML_CLASS_DIAGRAM_IMAGE = '/src/assets/images/uml_class_fr_1786882522184.jpg';

export interface UmlActor {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
}

export interface UmlUseCase {
  id: string;
  name: string;
  category: string;
  actors: string[];
  includes?: string[];
  extends?: string[];
  description: string;
}

export interface UmlClass {
  name: string;
  stereotype?: string;
  description: string;
  attributes: { visibility: '+' | '-' | '#'; name: string; type: string }[];
  methods: { visibility: '+' | '-' | '#'; name: string; returnType: string; params?: string }[];
  relations: { target: string; type: 'association' | 'inheritance' | 'composition' | 'aggregation'; label: string; multiplicity: string }[];
}

export const umlActors: UmlActor[] = [
  {
    id: 'citizen',
    name: 'Usager / Citoyen',
    role: 'Acteur Principal',
    description: 'Consulte les services, réserve des créneaux, présente son QR code et gère ses RDV.',
    color: '#3B82F6',
  },
  {
    id: 'agent',
    name: 'Agent de Guichet',
    role: 'Acteur Opérationnel',
    description: 'Scanne les tickets QR codes, vérifie les justificatifs et valide la présence des usagers.',
    color: '#10B981',
  },
  {
    id: 'admin',
    name: 'Responsable / Admin',
    role: 'Acteur Superviseur',
    description: 'Gère le catalogue des démarches (CRUD), configure les créneaux et supervise les statistiques.',
    color: '#8B5CF6',
  },
  {
    id: 'fcm',
    name: 'Système Firebase FCM',
    role: 'Système Tiers',
    description: 'Distribue les notifications push temps réel et les rappels automatiques 24h & 1h.',
    color: '#F59E0B',
  },
];

export const umlUseCases: UmlUseCase[] = [
  {
    id: 'uc-1',
    name: 'S\'authentifier / S\'inscrire (JWT)',
    category: 'Authentification & Sécurité',
    actors: ['citizen', 'agent', 'admin'],
    description: 'Connexion sécurisée avec email/mot de passe et obtention d\'un jeton JWT porteur des rôles.',
  },
  {
    id: 'uc-2',
    name: 'Consulter le catalogue des démarches & pièces',
    category: 'Information & Démarches',
    actors: ['citizen', 'agent', 'admin'],
    description: 'Parcourir les démarches (CNI, Passeport, État Civil, etc.) et la liste des justificatifs requis.',
  },
  {
    id: 'uc-3',
    name: 'Rechercher & filtrer les services (Mots-clés, Agence)',
    category: 'Information & Démarches',
    actors: ['citizen', 'admin'],
    description: 'Filtrer dynamiquement les démarches par agence, catégorie ou mot-clé.',
  },
  {
    id: 'uc-4',
    name: 'Réserver un créneau horaire',
    category: 'Gestion des Rendez-vous',
    actors: ['citizen'],
    includes: ['Vérifier disponibilité du créneau', 'Verrouillage atomique (Anti double-réservation)'],
    extends: ['Déclencher notification FCM (Confirmation)'],
    description: 'Sélection d\'une agence, d\'une date et d\'un créneau avec confirmation immédiate.',
  },
  {
    id: 'uc-5',
    name: 'Générer & Afficher le Pass QR Code numérique',
    category: 'Gestion des Rendez-vous',
    actors: ['citizen'],
    includes: ['Encodage sécurisé des données du rendez-vous'],
    description: 'Création d\'un QR code haute résolution contenant le numéro de RDV et signature.',
  },
  {
    id: 'uc-6',
    name: 'Consulter l\'historique et statut de ses RDV',
    category: 'Gestion des Rendez-vous',
    actors: ['citizen'],
    description: 'Vue détaillée de tous les rendez-vous (en attente, confirmés, passés, annulés).',
  },
  {
    id: 'uc-7',
    name: 'Modifier / Reporter un créneau de rendez-vous',
    category: 'Gestion des Rendez-vous',
    actors: ['citizen', 'admin'],
    includes: ['Vérifier nouvelle disponibilité'],
    description: 'Changement de date ou d\'heure avec libération automatique de l\'ancien créneau.',
  },
  {
    id: 'uc-8',
    name: 'Annuler un rendez-vous',
    category: 'Gestion des Rendez-vous',
    actors: ['citizen', 'admin'],
    includes: ['Libérer le créneau horaire', 'Envoyer notification d\'annulation'],
    description: 'Annulation d\'un créneau avec motif et mise à jour immédiate des quotas de l\'agence.',
  },
  {
    id: 'uc-9',
    name: 'Scanner le QR Code usager au guichet',
    category: 'Guichet & Validation',
    actors: ['agent', 'admin'],
    includes: ['Décodage payload & Vérification validité'],
    description: 'Lecture vidéo ou caméra du pass QR code présenté sur le smartphone de l\'usager.',
  },
  {
    id: 'uc-10',
    name: 'Valider la présence et honorer le rendez-vous',
    category: 'Guichet & Validation',
    actors: ['agent', 'admin'],
    includes: ['Mettre à jour statut = honoré'],
    description: 'Validation de la réception de l\'usager avec horodatage et nom de l\'agent responsable.',
  },
  {
    id: 'uc-11',
    name: 'Gérer les services administratifs (CRUD)',
    category: 'Administration & Supervision',
    actors: ['admin'],
    description: 'Création, modification des durées/quotas, ajout des justificatifs et suppression des services.',
  },
  {
    id: 'uc-12',
    name: 'Consulter les statistiques & flux de fréquentation',
    category: 'Administration & Supervision',
    actors: ['admin'],
    description: 'Tableau de bord décisionnel avec taux de présence, créneaux saturés et volumes par agence.',
  },
  {
    id: 'uc-13',
    name: 'Synchronisation & Cache Hors-ligne (SQLite)',
    category: 'Architecture & Données',
    actors: ['citizen'],
    description: 'Stockage local avec sqflite pour consulter ses tickets sans connexion Internet active.',
  },
];

export const umlClasses: UmlClass[] = [
  {
    name: 'User',
    stereotype: 'Entity / Abstract',
    description: 'Entité de base représentant un utilisateur du système.',
    attributes: [
      { visibility: '-', name: 'id', type: 'String' },
      { visibility: '+', name: 'email', type: 'String' },
      { visibility: '-', name: 'passwordHash', type: 'String' },
      { visibility: '+', name: 'fullName', type: 'String' },
      { visibility: '+', name: 'firstName', type: 'String' },
      { visibility: '+', name: 'phone', type: 'String' },
      { visibility: '+', name: 'role', type: 'UserRole (citizen|agent|admin)' },
      { visibility: '+', name: 'fcmToken', type: 'String?' },
      { visibility: '+', name: 'createdAt', type: 'DateTime' },
    ],
    methods: [
      { visibility: '+', name: 'fromJson', returnType: 'User', params: 'Map<String, dynamic> json' },
      { visibility: '+', name: 'toJson', returnType: 'Map<String, dynamic>' },
      { visibility: '+', name: 'hasRole', returnType: 'bool', params: 'UserRole role' },
    ],
    relations: [
      { target: 'Appointment', type: 'association', label: 'possède', multiplicity: '1..*' },
      { target: 'AppNotification', type: 'composition', label: 'reçoit', multiplicity: '0..*' },
    ],
  },
  {
    name: 'Agency',
    stereotype: 'Entity',
    description: 'Structure publique d\'accueil physique (Mairie, Préfecture, etc.).',
    attributes: [
      { visibility: '+', name: 'id', type: 'String' },
      { visibility: '+', name: 'name', type: 'String' },
      { visibility: '+', name: 'address', type: 'String' },
      { visibility: '+', name: 'city', type: 'String' },
      { visibility: '+', name: 'postalCode', type: 'String' },
      { visibility: '+', name: 'phone', type: 'String' },
      { visibility: '+', name: 'openingHours', type: 'String' },
    ],
    methods: [
      { visibility: '+', name: 'fromJson', returnType: 'Agency', params: 'Map<String, dynamic> json' },
      { visibility: '+', name: 'toJson', returnType: 'Map<String, dynamic>' },
    ],
    relations: [
      { target: 'Service', type: 'aggregation', label: 'propose', multiplicity: '1..*' },
      { target: 'TimeSlot', type: 'composition', label: 'héberge', multiplicity: '1..*' },
    ],
  },
  {
    name: 'Service',
    stereotype: 'Entity',
    description: 'Démarche administrative (CNI, Passeport, État Civil, etc.).',
    attributes: [
      { visibility: '+', name: 'id', type: 'String' },
      { visibility: '+', name: 'name', type: 'String' },
      { visibility: '+', name: 'category', type: 'String' },
      { visibility: '+', name: 'description', type: 'String' },
      { visibility: '+', name: 'requiredDocuments', type: 'List<String>' },
      { visibility: '+', name: 'durationMinutes', type: 'int' },
      { visibility: '+', name: 'maxSlotsPerTime', type: 'int' },
      { visibility: '+', name: 'agencyIds', type: 'List<String>' },
    ],
    methods: [
      { visibility: '+', name: 'fromJson', returnType: 'Service', params: 'Map<String, dynamic> json' },
      { visibility: '+', name: 'toJson', returnType: 'Map<String, dynamic>' },
    ],
    relations: [
      { target: 'TimeSlot', type: 'composition', label: 'génère', multiplicity: '1..*' },
    ],
  },
  {
    name: 'TimeSlot',
    stereotype: 'ValueObject',
    description: 'Plage horaire discrète pour une démarche dans une agence.',
    attributes: [
      { visibility: '+', name: 'id', type: 'String' },
      { visibility: '+', name: 'serviceId', type: 'String' },
      { visibility: '+', name: 'agencyId', type: 'String' },
      { visibility: '+', name: 'slotDate', type: 'String' },
      { visibility: '+', name: 'startTime', type: 'String' },
      { visibility: '+', name: 'endTime', type: 'String' },
      { visibility: '+', name: 'capacity', type: 'int' },
      { visibility: '+', name: 'bookedCount', type: 'int' },
      { visibility: '+', name: 'isAvailable', type: 'bool' },
    ],
    methods: [
      { visibility: '+', name: 'hasRemainingCapacity', returnType: 'bool' },
    ],
    relations: [
      { target: 'Appointment', type: 'association', label: 'réservé par', multiplicity: '0..*' },
    ],
  },
  {
    name: 'Appointment',
    stereotype: 'AggregateRoot',
    description: 'Rendez-vous complet validé avec pass QR code et horodatage.',
    attributes: [
      { visibility: '+', name: 'id', type: 'String' },
      { visibility: '+', name: 'appointmentNumber', type: 'String' },
      { visibility: '+', name: 'userId', type: 'String' },
      { visibility: '+', name: 'serviceId', type: 'String' },
      { visibility: '+', name: 'agencyId', type: 'String' },
      { visibility: '+', name: 'slotDate', type: 'String' },
      { visibility: '+', name: 'startTime', type: 'String' },
      { visibility: '+', name: 'endTime', type: 'String' },
      { visibility: '+', name: 'status', type: 'AppointmentStatus' },
      { visibility: '+', name: 'qrCodeData', type: 'String' },
      { visibility: '+', name: 'validatedAt', type: 'DateTime?' },
      { visibility: '+', name: 'validatedBy', type: 'String?' },
    ],
    methods: [
      { visibility: '+', name: 'validateAtCounter', returnType: 'void', params: 'String agentId' },
      { visibility: '+', name: 'cancel', returnType: 'void', params: 'String reason' },
      { visibility: '+', name: 'reschedule', returnType: 'void', params: 'String newDate, String newTime' },
      { visibility: '+', name: 'generateQrCode', returnType: 'String' },
    ],
    relations: [
      { target: 'AppNotification', type: 'association', label: 'déclenche', multiplicity: '1..*' },
    ],
  },
  {
    name: 'DatabaseHelper',
    stereotype: 'Service / Local Persistence',
    description: 'Gestionnaire SQLite pour le cache et le fonctionnement hors-ligne (sqflite).',
    attributes: [
      { visibility: '-', name: '_database', type: 'Database?' },
    ],
    methods: [
      { visibility: '+', name: 'initDatabase', returnType: 'Future<Database>' },
      { visibility: '+', name: 'saveAppointmentLocal', returnType: 'Future<int>', params: 'Appointment appt' },
      { visibility: '+', name: 'getCachedAppointments', returnType: 'Future<List<Appointment>>' },
      { visibility: '+', name: 'syncPendingOfflineData', returnType: 'Future<SyncResult>' },
    ],
    relations: [
      { target: 'Appointment', type: 'association', label: 'persiste en local', multiplicity: '*' },
    ],
  },
  {
    name: 'AppointmentProvider',
    stereotype: 'Provider / State Management',
    description: 'Gestionnaire d\'état ChangeNotifier pour Flutter.',
    attributes: [
      { visibility: '-', name: '_appointments', type: 'List<Appointment>' },
      { visibility: '-', name: '_isLoading', type: 'bool' },
      { visibility: '-', name: '_errorMessage', type: 'String?' },
    ],
    methods: [
      { visibility: '+', name: 'fetchAppointments', returnType: 'Future<void>' },
      { visibility: '+', name: 'bookAppointment', returnType: 'Future<bool>', params: 'BookingRequest req' },
      { visibility: '+', name: 'cancelAppointment', returnType: 'Future<bool>', params: 'String id' },
      { visibility: '+', name: 'rescheduleAppointment', returnType: 'Future<bool>', params: 'String id, String date, String time' },
    ],
    relations: [
      { target: 'Appointment', type: 'association', label: 'expose', multiplicity: '*' },
      { target: 'DatabaseHelper', type: 'association', label: 'utilise', multiplicity: '1' },
    ],
  },
];

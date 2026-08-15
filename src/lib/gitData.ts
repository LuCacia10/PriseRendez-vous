import { GitCommit } from '../types';

export const gitCommits: GitCommit[] = [
  {
    hash: 'a1f893e',
    type: 'feat',
    message: 'feat(qr): intégration du générateur et scanner de pass QR code guichet',
    author: 'Equipe Mobile <dev@admin.fr>',
    date: '2026-08-14 18:32',
    filesChanged: 6,
  },
  {
    hash: 'b7c4021',
    type: 'feat',
    message: 'feat(fcm): mise en place des notifications push et rappels automatiques 24h/1h',
    author: 'Equipe Mobile <dev@admin.fr>',
    date: '2026-08-14 16:15',
    filesChanged: 5,
  },
  {
    hash: 'c89e144',
    type: 'feat',
    message: 'feat(booking): assistant de prise de rendez-vous avec verrouillage atomique de créneau',
    author: 'Equipe Backend <backend@admin.fr>',
    date: '2026-08-14 14:00',
    filesChanged: 8,
  },
  {
    hash: 'd32098b',
    type: 'feat',
    message: 'feat(auth): authentification JWT sécurisée et gestion multi-rôles (Citoyen/Agent/Admin)',
    author: 'Equipe Backend <backend@admin.fr>',
    date: '2026-08-13 19:40',
    filesChanged: 7,
  },
  {
    hash: 'e459a10',
    type: 'feat',
    message: 'feat(sqlite): implémentation du stockage local offline avec SQLite (sqflite) et synchronisation',
    author: 'Equipe Mobile <dev@admin.fr>',
    date: '2026-08-13 15:20',
    filesChanged: 4,
  },
  {
    hash: 'f671bc9',
    type: 'feat',
    message: 'feat(crud): gestion administrative complète des démarches et supervision des créneaux',
    author: 'Equipe Web/Admin <admin@admin.fr>',
    date: '2026-08-13 11:30',
    filesChanged: 9,
  },
  {
    hash: 'a89104f',
    type: 'docs',
    message: 'docs(uml): ajout des diagrammes de cas d\'utilisation et de classes conformes UML 2.5',
    author: 'Architecte Logiciel <arch@admin.fr>',
    date: '2026-08-12 17:00',
    filesChanged: 3,
  },
  {
    hash: 'b1129aa',
    type: 'refactor',
    message: 'refactor(clean-arch): réorganisation modulaire core/models/services/repositories/providers',
    author: 'Lead Dev Flutter <lead@admin.fr>',
    date: '2026-08-12 14:10',
    filesChanged: 14,
  },
  {
    hash: 'c0045e2',
    type: 'chore',
    message: 'chore(init): initialisation du dépôt Flutter et serveur REST Node.js/MySQL',
    author: 'DevOps Team <devops@admin.fr>',
    date: '2026-08-12 09:00',
    filesChanged: 12,
  },
];

export const gitReadme = `# 📱 Rendez-vous Administratifs - Mobile Flutter & Backend REST Node.js & MySQL

Solution complète et modulaire de prise de rendez-vous pour guichets administratifs (Mairies, Préfectures, Services Publics), intégrant :
- Application mobile **Flutter (Dart)** avec gestion d'état Provider et persistance locale **SQLite**.
- Backend **Node.js (Express & TypeScript)** sécurisé par **JWT** et base de données **MySQL 8.0+**.
- Système de **Pass QR Code** scannable en temps réel par les agents de guichet.
- Système de notifications push **Firebase Cloud Messaging (FCM)**.
- Diagrammes d'architecture **UML 2.5** (Cas d'utilisation & Classes).

---

## 🏗️ Architecture du Projet Flutter (Clean & Modular)

\`\`\`
lib/
├── core/
│   ├── constants/app_constants.dart
│   ├── network/api_client.dart
│   ├── theme/app_theme.dart
│   └── errors/app_exceptions.dart
├── models/
│   ├── user_model.dart
│   ├── service_model.dart
│   ├── agency_model.dart
│   ├── appointment_model.dart
│   ├── time_slot_model.dart
│   └── notification_model.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── database_helper.dart      # Persistance locale SQLite (sqflite)
│   └── notification_service.dart # Gestion Firebase Cloud Messaging (FCM)
├── repositories/
│   ├── auth_repository.dart
│   ├── appointment_repository.dart
│   └── service_repository.dart
├── providers/
│   ├── auth_provider.dart
│   ├── appointment_provider.dart
│   ├── service_provider.dart
│   └── theme_provider.dart
├── screens/
│   ├── splash_screen.dart
│   ├── auth/login_screen.dart
│   ├── auth/register_screen.dart
│   ├── citizen/dashboard_screen.dart
│   ├── citizen/service_catalog_screen.dart
│   ├── citizen/booking_wizard_screen.dart
│   ├── citizen/qr_pass_screen.dart
│   ├── citizen/appointments_history_screen.dart
│   ├── agent/qr_scanner_screen.dart
│   └── admin/admin_dashboard_screen.dart
├── widgets/
│   ├── custom_button.dart
│   ├── custom_text_field.dart
│   ├── status_badge.dart
│   └── appointment_card.dart
├── routes/
│   └── app_routes.dart
├── utils/
│   ├── validators.dart
│   └── date_formatter.dart
└── main.dart
\`\`\`

---

## 🚀 Démarrage Rapide

### 1. Backend Node.js
\`\`\`bash
cd server
npm install
npm run build
npm start
\`\`\`

### 2. Application Flutter
\`\`\`bash
cd app
flutter pub get
flutter run
\`\`\`

---

## 👥 Rôles et Permissions

| Fonctionnalité | Citoyen / Usager | Agent de Guichet | Responsable / Admin |
|---|:---:|:---:|:---:|
| Consultation Catalogue | ✅ | ✅ | ✅ |
| Prise de RDV & Pass QR | ✅ | ❌ | ❌ |
| Historique & Annulation | ✅ | ❌ | ✅ |
| Scanner Pass QR Guichet | ❌ | ✅ | ✅ |
| Validation de présence | ❌ | ✅ | ✅ |
| CRUD Services & Démarches | ❌ | ❌ | ✅ |
| Statistiques & KPIs | ❌ | ❌ | ✅ |
`;

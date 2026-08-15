export const flutterCodebase: Record<string, string> = {
  'pubspec.yaml': `name: rendezvous_admin_app
description: "Application Flutter de prise de rendez-vous administratifs avec tickets QR codes et notifications FCM"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # Gestion d'état
  provider: ^6.1.2
  # Réseau & API REST
  http: ^1.2.1
  # Stockage local SQLite (Persistance hors-ligne)
  sqflite: ^2.3.3+1
  path_provider: ^2.1.3
  path: ^1.9.0
  # QR Code Génération & Scanner
  qr_flutter: ^4.1.0
  mobile_scanner: ^5.1.1
  # Notifications Push & Stockage sécurisé
  flutter_secure_storage: ^9.2.2
  intl: ^0.19.0
  shared_preferences: ^2.2.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`,

  'lib/main.dart': `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/appointment_provider.dart';
import 'providers/service_provider.dart';
import 'routes/app_routes.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..checkAuthStatus()),
        ChangeNotifierProvider(create: (_) => ServiceProvider()),
        ChangeNotifierProvider(create: (_) => AppointmentProvider()),
      ],
      child: MaterialApp(
        title: 'Rendez-vous Publics',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        initialRoute: AppRoutes.splash,
        onGenerateRoute: AppRoutes.generateRoute,
        home: const SplashScreen(),
      ),
    );
  }
}
`,

  'lib/core/constants/app_constants.dart': `class AppConstants {
  static const String appName = 'Rendez-vous Administratifs';
  static const String apiBaseUrl = 'https://api.services-publics.gouv.fr/api';
  static const int defaultSlotDuration = 15; // minutes
  static const String tokenStorageKey = 'jwt_auth_token';
  static const String userStorageKey = 'current_cached_user';
}
`,

  'lib/core/theme/app_theme.dart': `import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryBlue = Color(0xFF1E3A8A);
  static const Color accentTeal = Color(0xFF0D9488);
  static const Color successGreen = Color(0xFF10B981);
  static const Color warningOrange = Color(0xFFF59E0B);
  static const Color dangerRed = Color(0xFFEF4444);
  static const Color neutralDark = Color(0xFF0F172A);
  static const Color neutralLight = Color(0xFFF8FAFC);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: primaryBlue,
        secondary: accentTeal,
        surface: Colors.white,
        background: neutralLight,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryBlue,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        brightness: Brightness.dark,
        primary: const Color(0xFF3B82F6),
        secondary: accentTeal,
        surface: const Color(0xFF1E293B),
        background: neutralDark,
      ),
      fontFamily: 'Inter',
    );
  }
}
`,

  'lib/models/user_model.dart': `enum UserRole { citizen, agent, admin }

class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String firstName;
  final String phone;
  final String? identityCardNum;
  final UserRole role;
  final String? fcmToken;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.firstName,
    required this.phone,
    this.identityCardNum,
    required this.role,
    this.fcmToken,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      firstName: json['firstName'] ?? '',
      phone: json['phone'] ?? '',
      identityCardNum: json['identityCardNum'],
      role: _parseRole(json['role']),
      fcmToken: json['fcmToken'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  static UserRole _parseRole(String? roleStr) {
    switch (roleStr) {
      case 'agent':
        return UserRole.agent;
      case 'admin':
        return UserRole.admin;
      default:
        return UserRole.citizen;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'firstName': firstName,
      'phone': phone,
      'identityCardNum': identityCardNum,
      'role': role.name,
      'fcmToken': fcmToken,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
`,

  'lib/models/service_model.dart': `class ServiceModel {
  final String id;
  final String name;
  final String category;
  final String description;
  final List<String> requiredDocuments;
  final int durationMinutes;
  final int maxSlotsPerTime;
  final List<String> agencyIds;
  final String? iconName;

  ServiceModel({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.requiredDocuments,
    required this.durationMinutes,
    required this.maxSlotsPerTime,
    required this.agencyIds,
    this.iconName,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? '',
      description: json['description'] ?? '',
      requiredDocuments: List<String>.from(json['requiredDocuments'] ?? []),
      durationMinutes: json['durationMinutes'] ?? 15,
      maxSlotsPerTime: json['maxSlotsPerTime'] ?? 3,
      agencyIds: List<String>.from(json['agencyIds'] ?? []),
      iconName: json['iconName'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'description': description,
      'requiredDocuments': requiredDocuments,
      'durationMinutes': durationMinutes,
      'maxSlotsPerTime': maxSlotsPerTime,
      'agencyIds': agencyIds,
      'iconName': iconName,
    };
  }
}
`,

  'lib/models/appointment_model.dart': `enum AppointmentStatus {
  en_attente,
  confirme,
  honore,
  annule,
  absent,
}

class AppointmentModel {
  final String id;
  final String appointmentNumber; // e.g. A-2026-000124
  final String userId;
  final String userName;
  final String userEmail;
  final String userPhone;
  final String serviceId;
  final String serviceName;
  final String agencyId;
  final String agencyName;
  final String agencyAddress;
  final String slotDate; // YYYY-MM-DD
  final String startTime; // HH:mm
  final String endTime; // HH:mm
  final AppointmentStatus status;
  final String qrCodeData;
  final DateTime createdAt;
  final DateTime? validatedAt;
  final String? validatedBy;
  final String? notes;

  AppointmentModel({
    required this.id,
    required this.appointmentNumber,
    required this.userId,
    required this.userName,
    required this.userEmail,
    required this.userPhone,
    required this.serviceId,
    required this.serviceName,
    required this.agencyId,
    required this.agencyName,
    required this.agencyAddress,
    required this.slotDate,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.qrCodeData,
    required this.createdAt,
    this.validatedAt,
    this.validatedBy,
    this.notes,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'] ?? '',
      appointmentNumber: json['appointmentNumber'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      userEmail: json['userEmail'] ?? '',
      userPhone: json['userPhone'] ?? '',
      serviceId: json['serviceId'] ?? '',
      serviceName: json['serviceName'] ?? '',
      agencyId: json['agencyId'] ?? '',
      agencyName: json['agencyName'] ?? '',
      agencyAddress: json['agencyAddress'] ?? '',
      slotDate: json['slotDate'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      status: _parseStatus(json['status']),
      qrCodeData: json['qrCodeData'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      validatedAt: json['validatedAt'] != null
          ? DateTime.parse(json['validatedAt'])
          : null,
      validatedBy: json['validatedBy'],
      notes: json['notes'],
    );
  }

  static AppointmentStatus _parseStatus(String? str) {
    switch (str) {
      case 'honore':
        return AppointmentStatus.honore;
      case 'annule':
        return AppointmentStatus.annule;
      case 'absent':
        return AppointmentStatus.absent;
      case 'en_attente':
        return AppointmentStatus.en_attente;
      default:
        return AppointmentStatus.confirme;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'appointmentNumber': appointmentNumber,
      'userId': userId,
      'userName': userName,
      'userEmail': userEmail,
      'userPhone': userPhone,
      'serviceId': serviceId,
      'serviceName': serviceName,
      'agencyId': agencyId,
      'agencyName': agencyName,
      'agencyAddress': agencyAddress,
      'slotDate': slotDate,
      'startTime': startTime,
      'endTime': endTime,
      'status': status.name,
      'qrCodeData': qrCodeData,
      'createdAt': createdAt.toIso8601String(),
      'validatedAt': validatedAt?.toIso8601String(),
      'validatedBy': validatedBy,
      'notes': notes,
    };
  }
}
`,

  'lib/services/api_service.dart': `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants/app_constants.dart';
import '../models/service_model.dart';
import '../models/appointment_model.dart';

class ApiService {
  final String baseUrl;
  String? _token;

  ApiService({this.baseUrl = AppConstants.apiBaseUrl});

  void setToken(String? token) {
    _token = token;
  }

  Map<String, String> _headers() {
    return {
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };
  }

  Future<List<ServiceModel>> fetchServices() async {
    final response = await http.get(
      Uri.parse('$baseUrl/services'),
      headers: _headers(),
    );
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((json) => ServiceModel.fromJson(json)).toList();
    } else {
      throw Exception('Échec de récupération des démarches.');
    }
  }

  Future<AppointmentModel> createAppointment({
    required String serviceId,
    required String agencyId,
    required String slotDate,
    required String startTime,
    required String endTime,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/appointments'),
      headers: _headers(),
      body: jsonEncode({
        'serviceId': serviceId,
        'agencyId': agencyId,
        'slotDate': slotDate,
        'startTime': startTime,
        'endTime': endTime,
      }),
    );
    if (response.statusCode == 201) {
      return AppointmentModel.fromJson(jsonDecode(response.body));
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Impossible de créer le rendez-vous.');
    }
  }

  Future<List<AppointmentModel>> fetchMyAppointments() async {
    final response = await http.get(
      Uri.parse('$baseUrl/appointments/me'),
      headers: _headers(),
    );
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((json) => AppointmentModel.fromJson(json)).toList();
    } else {
      throw Exception('Échec de chargement des rendez-vous.');
    }
  }

  Future<bool> cancelAppointment(String id, {String? reason}) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/appointments/$id/cancel'),
      headers: _headers(),
      body: jsonEncode({'reason': reason}),
    );
    return response.statusCode == 200;
  }
}
`,

  'lib/services/database_helper.dart': `import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/appointment_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('rendezvous_offline.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE cached_appointments (
            id TEXT PRIMARY KEY,
            appointment_number TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            user_phone TEXT NOT NULL,
            service_id TEXT NOT NULL,
            service_name TEXT NOT NULL,
            agency_id TEXT NOT NULL,
            agency_name TEXT NOT NULL,
            agency_address TEXT NOT NULL,
            slot_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            status TEXT NOT NULL,
            qr_code_data TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        ''');
      },
    );
  }

  Future<int> cacheAppointment(AppointmentModel appointment) async {
    final db = await instance.database;
    return await db.insert(
      'cached_appointments',
      {
        'id': appointment.id,
        'appointment_number': appointment.appointmentNumber,
        'user_id': appointment.userId,
        'user_name': appointment.userName,
        'user_email': appointment.userEmail,
        'user_phone': appointment.userPhone,
        'service_id': appointment.serviceId,
        'service_name': appointment.serviceName,
        'agency_id': appointment.agencyId,
        'agency_name': appointment.agencyName,
        'agency_address': appointment.agencyAddress,
        'slot_date': appointment.slotDate,
        'start_time': appointment.startTime,
        'end_time': appointment.endTime,
        'status': appointment.status.name,
        'qr_code_data': appointment.qrCodeData,
        'created_at': appointment.createdAt.toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }
}
`,

  'lib/providers/appointment_provider.dart': `import 'package:flutter/foundation.dart';
import '../models/appointment_model.dart';
import '../services/api_service.dart';
import '../services/database_helper.dart';

class AppointmentProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<AppointmentModel> _appointments = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<AppointmentModel> get appointments => _appointments;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadAppointments(String token) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    _apiService.setToken(token);
    try {
      _appointments = await _apiService.fetchMyAppointments();
      // Synchroniser avec SQLite local
      for (var appt in _appointments) {
        await DatabaseHelper.instance.cacheAppointment(appt);
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> bookAppointment({
    required String token,
    required String serviceId,
    required String agencyId,
    required String slotDate,
    required String startTime,
    required String endTime,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    _apiService.setToken(token);
    try {
      final newAppt = await _apiService.createAppointment(
        serviceId: serviceId,
        agencyId: agencyId,
        slotDate: slotDate,
        startTime: startTime,
        endTime: endTime,
      );
      _appointments.insert(0, newAppt);
      await DatabaseHelper.instance.cacheAppointment(newAppt);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> cancelAppointment(String token, String appointmentId) async {
    _apiService.setToken(token);
    final success = await _apiService.cancelAppointment(appointmentId);
    if (success) {
      final index = _appointments.indexWhere((a) => a.id == appointmentId);
      if (index != -1) {
        // Update local status
        notifyListeners();
      }
    }
    return success;
  }
}
`,

  'lib/screens/citizen/qr_pass_screen.dart': `import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/appointment_model.dart';

class QrPassScreen extends StatelessWidget {
  final AppointmentModel appointment;

  const QrPassScreen({super.key, required this.appointment});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mon Pass QR de Passage'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Text(
                    'N° \${appointment.appointmentNumber}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E3A8A),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    appointment.serviceName,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\${appointment.slotDate} à \${appointment.startTime}',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                  const Divider(height: 32),
                  QrImageView(
                    data: appointment.qrCodeData,
                    version: QrVersions.auto,
                    size: 220.0,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Présentez ce QR code sous la borne ou au guichet pour enregistrer votre arrivée.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,

  'lib/screens/agent/qr_scanner_screen.dart': `import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController controller = MobileScannerController();
  bool isProcessing = false;

  void onDetect(BarcodeCapture capture) {
    if (isProcessing) return;
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        setState(() => isProcessing = true);
        _handleScanSuccess(barcode.rawValue!);
        break;
      }
    }
  }

  void _handleScanSuccess(String payload) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Pass Détecté !'),
        content: Text('Données du ticket : $payload'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              setState(() => isProcessing = false);
            },
            child: const Text('Valider Présence'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scanner Guichet')),
      body: MobileScanner(
        controller: controller,
        onDetect: onDetect,
      ),
    );
  }
}
`,

  'lib/routes/app_routes.dart': `import 'package:flutter/material.dart';
import '../screens/splash_screen.dart';

class AppRoutes {
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String dashboard = '/dashboard';
  static const String services = '/services';
  static const String booking = '/booking';
  static const String history = '/history';
  static const String scanner = '/scanner';
  static const String admin = '/admin';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case splash:
        return MaterialPageRoute(builder: (_) => const SplashScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('Page non trouvée : \${settings.name}')),
          ),
        );
    }
  }
}
`,

  'lib/utils/validators.dart': `class Validators {
  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'L\'adresse email est obligatoire.';
    }
    final emailRegex = RegExp(r'^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Format d\'adresse email invalide.';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le mot de passe est obligatoire.';
    }
    if (value.length < 6) {
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    }
    return null;
  }

  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) {
      return 'Le champ $fieldName est obligatoire.';
    }
    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Le numéro de téléphone est requis.';
    }
    final phoneRegex = RegExp(r'^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$');
    if (!phoneRegex.hasMatch(value.trim())) {
      return 'Format de téléphone invalide (ex: 06 12 34 56 78).';
    }
    return null;
  }
}
`,
};

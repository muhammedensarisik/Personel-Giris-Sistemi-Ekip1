import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobil_arayuz/screens/auth/login_page.dart';
import 'package:mobil_arayuz/screens/main_screen.dart';
import 'package:mobil_arayuz/theme/AppTheme.dart';
import 'package:mobil_arayuz/theme/theme_notifier.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('tr_TR', null);
  
  await loadTheme(); 
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, currentThemeMode, child) {
        return MaterialApp(
          
          title: 'Personel Takip Sistemi',
          theme: AppTheme.lightTheme, 
          darkTheme: AppTheme.darkTheme,
          themeMode: currentThemeMode,
          debugShowCheckedModeBanner: false,
          initialRoute: '/login',
          scrollBehavior: const MaterialScrollBehavior().copyWith(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),),
          routes: {
            '/login': (context) => const LoginPage(),
            '/main': (context) => const MainScreen(),
          },
        );
      },
    );
  }
}
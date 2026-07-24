import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobil_arayuz/screens/auth/login_page.dart';
import 'package:mobil_arayuz/screens/main_screen.dart';
import 'package:mobil_arayuz/theme/AppTheme.dart';
import 'package:mobil_arayuz/theme/theme_notifier.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('tr_TR', null);
  
  // UYGULAMA AÇILMADAN ÖNCE HAFIZADAKİ TEMAYI YÜKLE
  await loadTheme(); 
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // MaterialApp'i dinleyici ile sarmalıyoruz!
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, currentThemeMode, child) {
        return MaterialApp(
          title: 'Personel Takip Sistemi',
          // KENDİ YAZDIĞIN TEMALARI BURAYA BAĞLADIK
          theme: AppTheme.lightTheme, 
          darkTheme: AppTheme.darkTheme,
          // NOTIFIER'DAN GELEN ANLIK TEMAYI BURAYA VERDİK
          themeMode: currentThemeMode, 
          debugShowCheckedModeBanner: false,
          initialRoute: '/login',
          routes: {
            '/login': (context) => const MainScreen(),
            '/main': (context) => const MainScreen(),
          },
        );
      },
    );
  }
}
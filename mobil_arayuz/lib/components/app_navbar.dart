import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/bildirimler/notificationPage.dart';
import 'package:mobil_arayuz/screens/gecmis/history_page.dart';
import 'package:mobil_arayuz/screens/qr_scanner/camera_page.dart';
import 'package:mobil_arayuz/screens/settings/settings.dart';
import '../model/nav_model.dart';
import '../screens/home/home_page.dart';

class AppNavbar {
  static List<NavItem> getItems() {
    return [
      NavItem(label: "Ana Sayfa", icon: Icons.home, page:  HomePage()),
      NavItem(label: "Geçmiş", icon: Icons.history, page:  HistoryPage()),
      NavItem(label: "QR Okut", icon: Icons.qr_code_scanner, page: CameraPage()),
      NavItem(label: "Bildirim", icon: Icons.notifications, page: NotificationPage()),
      NavItem(label: "Ayarlar", icon: Icons.settings, page:  SettingsPage()),
    ];
  }
}

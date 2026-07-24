import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/settings/widgets/NotificationSection.dart';
import 'package:mobil_arayuz/screens/settings/widgets/System_Support.dart';
import 'package:mobil_arayuz/screens/settings/widgets/profile_widget.dart';
import 'package:mobil_arayuz/services/auth_service.dart';


class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Ayarlar"),
        centerTitle: true,
      ),
      // 1. body'yi doğrudan SingleChildScrollView ile sarmala
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, // Başlıkları sola yasladık
          children: [
            const SectionHeader(title: "Profil Yönetimi"),
            const ProfileWidget(),
            const SizedBox(height: 25), // Aralıkları genişlettik

            const SectionHeader(title: "Bildirim ve Tercihler"),
            const NotificationSection(),
            const SizedBox(height: 25),

            const SectionHeader(title: "Sistem ve Destek"),
            const SystemSupportSection(),
            
            const SizedBox(height: 25), 
            
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  AuthService().logout();

                  // 2. Kullanıcıyı Login ekranına yönlendir ve geriye dönük tüm sayfaları temizle
                  if (context.mounted) {
                    Navigator.pushNamedAndRemoveUntil(
                      context, 
                      '/login', // Veya rota ismin neyse (örn: '/auth' ya da LoginPage())
                      (route) => false, // Bütün önceki sayfa geçmişini siler!
                    );
                  }
                },
                child: const Text(
                  "Çıkış Yap", 
                  style: TextStyle( fontSize: 16, fontWeight: FontWeight.bold)
                ),
              ),
            ),
            const SizedBox(height: 60), 
          ],
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  const SectionHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
  children: [
    Container(
      width: 5,
      height: 22,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
      ),
    ),
    const SizedBox(width:10),
    Text(
      title,
      style: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 18,
      ),
    ),
  ],
);
  }
}
import 'package:flutter/material.dart';
import 'package:mobil_arayuz/model/request_model.dart';
import 'package:mobil_arayuz/screens/home/requests/request_form_page.dart';
import 'settings_tile.dart';

class SystemSupportSection extends StatelessWidget {
  const SystemSupportSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SettingsTile(
          icon: Icons.help_outline,
          title: "Destek Al",
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const RequestFormPage(type: RequestType.rapor)),
            );
          },
        ),
        SettingsTile(
          icon: Icons.info_outline,
          title: "Hakkında",
          onTap: () {
            showAboutDialog(
              context: context,
              applicationName: "Personel Takip Sistemi",
              applicationVersion: "1.0.0",
              children: [
                const Text("Bu uygulama şirket içi personel takibi, QR girişi ve geçmiş takibi için geliştirilmiştir."),
              ],
            );
          },
        ),
      ],
    );
  }
}
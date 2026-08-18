import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/settings/widgets/support_form_page.dart';
import 'settings_tile.dart';

class SystemSupportSection extends StatelessWidget {
  const SystemSupportSection({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Column(
      children: [
        SettingsTile(
          icon: Icons.support_agent_rounded,
          title: "Destek Al / Arıza Bildir",
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const SupportFormPage()),
            );
          },
        ),
        SettingsTile(
          icon: Icons.info_outline_rounded,
          title: "Hakkında",
          onTap: () {
            showAboutDialog(
              context: context,
              applicationName: "Personel Takip Sistemi",
              applicationVersion: "1.0.0",
              children: [
                const Text("Bu uygulama şirket içi personel takibi, QR girişi ve destek talepleri için geliştirilmiştir."),
              ],
            );
          },
        ),
      ],
    );
  }
}
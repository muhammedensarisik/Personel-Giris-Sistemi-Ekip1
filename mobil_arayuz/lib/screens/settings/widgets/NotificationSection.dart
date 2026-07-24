import 'package:flutter/material.dart';
import 'package:mobil_arayuz/theme/theme_notifier.dart';
import 'settings_tile.dart';

class NotificationSection extends StatefulWidget {
  const NotificationSection({super.key});

  @override
  State<NotificationSection> createState() => _NotificationSectionState();
}

class _NotificationSectionState extends State<NotificationSection> {
  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, currentMode, child) {
        return Column(
          children: [
            SettingsTile(
              icon: Icons.dark_mode_outlined,
              title: "Koyu Mod",
              trailing: Switch(
                value: currentMode == ThemeMode.dark, 
                onChanged: (bool v) {
                  saveTheme(v);
                },
              ),
              onTap: () {
                // SettingsTile'a komple tıklanırsa da temayı değiştirip kaydet
                bool isCurrentlyDark = currentMode == ThemeMode.dark;
                saveTheme(!isCurrentlyDark);
              },
            ),
          ],
        );
      },
    );
  }
}
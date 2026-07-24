import 'package:flutter/material.dart';

class SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget? trailing;
  final VoidCallback onTap;

  const SettingsTile({
    super.key,
    required this.icon,
    required this.title,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // 1. TEMAYI YAKALA
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: colorScheme.primary.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon, 
          // 2. İKON RENGİNİ DİNAMİK YAP
          color: colorScheme.primary, 
        ),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.w500,
          // 3. YAZI RENGİNİ SABİT SİYAH YERİNE TEMAYA BAĞLA
          color: colorScheme.onSurface, 
        ),
      ),
      trailing: trailing ?? Icon(
        Icons.arrow_forward_ios_rounded, 
        size: 16, 
        // Ok ikonunu da dinamik gri/beyaz yap
        color: colorScheme.onSurface.withValues(alpha: 0.4),
      ),
    );
  }
}
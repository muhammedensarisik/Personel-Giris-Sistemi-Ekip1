import 'package:flutter/material.dart';

class QuickActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color; // Bu dışarıdan gelen vurgu rengi kalıyor (Örn: İkon için özel mavi)
  final VoidCallback onTap;

  const QuickActionButton({
    super.key,
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // 1. Temayı context üzerinden yakalıyoruz
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(16),
          // 3. Sabit gri yerine temanın sınır/ayırıcı rengi
          border: Border.all(
            color: theme.dividerColor.withValues(alpha: isDark ? 0.2 : 0.4),
          ),
          boxShadow: [
            BoxShadow(
              // 4. Koyu modda gölgeyi kapatıyoruz, açık modda hafif bir gölge bırakıyoruz
              color: theme.shadowColor.withValues(alpha: isDark ? 0.0 : 0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                // 5. withAlpha(26) yerine daha modern olan withOpacity(0.1) kullandık
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600, 
                fontSize: 12, 
                // 6. Sabit siyah yerine temanın metin rengi (Karanlıkta beyaz, aydınlıkta siyah)
                color: colorScheme.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
import 'package:flutter/material.dart';

class QuickInfoBox extends StatelessWidget {
  // Backend'den gelecek verileri tutan değişkenlerimiz (Aynen korundu)
  final String label;
  final String value;
  final IconData icon;
  final Color accentColor;
  final double? trendPercent;

  const QuickInfoBox({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.accentColor,
    this.trendPercent,
  });

  @override
  Widget build(BuildContext context) {
    // TEMAYI YAKALIYORUZ
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 12.0),
      decoration: BoxDecoration(
        color: Colors.transparent, 
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.dividerColor.withValues(alpha: isDark ? 0.2 : 0.4),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withValues(alpha: isDark ? 0.2 : 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 18, color: accentColor),
          ),
          const SizedBox(height: 10),
          Text(
            value, // Backend'den gelen saat/süre verisi (Örn: "08:30" veya "4s 15dk")
            style: TextStyle(
              fontWeight: FontWeight.bold, 
              fontSize: 15, 
              color: colorScheme.onSurface, // Karanlıkta otomatik beyaz olur
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label, // Başlık (Örn: "Giriş Saati", "Güncel Mesai")
            style: TextStyle(
              fontSize: 11, 
              color: colorScheme.onSurface.withValues(alpha: 0.6), 
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis,
          ),
          if (trendPercent != null) ...[
            const SizedBox(height: 6),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  trendPercent! >= 0 ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                  size: 10,
                  color: trendPercent! >= 0 ? Colors.green : Colors.redAccent,
                ),
                const SizedBox(width: 2),
                Text(
                  "${trendPercent!.abs().toStringAsFixed(0)}%",
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: trendPercent! >= 0 ? Colors.green : Colors.redAccent,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
import 'package:flutter/material.dart';

class AppBaseCard extends StatelessWidget {
  final Widget leadingIcon;      // Sol taraftaki ikon veya CircleAvatar
  final String title;            // Ana başlık (Örn: Bildirim adı, Tarih, "Bugünkü Durum")
  final String subtitle;         // Alt açıklama veya saatler aralığı
  final String? badgeText;       // Sağ üst/sağ köşedeki rozet (Örn: "Önemli", "Zamanında", "Aktif")
  final Color badgeColor;        // Rozetin ve vurgunun rengi (Yeşil, Kırmızı, Tema rengi vb.)
  final VoidCallback onTap;      // Karta tıklandığında çalışacak detay/aksiyon fonksiyonu
  final Widget? bottomChild;     // İsteğe bağlı alt kısım (Örn: Status kartındaki progress bar)
  final bool isDark;

  const AppBaseCard({
    super.key,
    required this.leadingIcon,
    required this.title,
    required this.subtitle,
    this.badgeText,
    required this.badgeColor,
    required this.onTap,
    this.bottomChild,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Ink(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              // Her yerde aynı gradient veya saydam arka plan mantığı
              color: isDark ? Colors.grey.shade900 : colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: badgeColor.withValues(alpha: 0.25),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: badgeColor.withValues(alpha: isDark ? 0.03 : 0.08),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // 1. Sol İkon / Avatar
                    leadingIcon,
                    const SizedBox(width: 14),

                    // 2. Orta Bilgi Alanı (Başlık ve Alt Açıklama)
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            subtitle,
                            style: TextStyle(
                              fontSize: 13,
                              color: colorScheme.onSurface.withValues(alpha: 0.65),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // 3. Sağ Kısım: Badge (Rozet)
                    if (badgeText != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: badgeColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          badgeText!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                
                // İsteğe bağlı ek içerik (Progress bar vb. için)
                if (bottomChild != null) ...[
                  const SizedBox(height: 12),
                  bottomChild!,
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
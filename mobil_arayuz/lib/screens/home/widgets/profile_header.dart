import 'package:flutter/material.dart';

class ProfileHeader extends StatelessWidget {
  final String name;
  final String department;

  const ProfileHeader({
    super.key,
    // Varsayılan değerleri güncelledik
    this.name = "Ramazan Detseli",
    this.department = "Yazılım Stajyeri",
  });

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 6) return "İyi geceler";
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi çalışmalar";
    return "İyi akşamlar";
  }

  @override
  Widget build(BuildContext context) {
    // 1. Temayı context'ten yakalıyoruz
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12.0),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20.0),
      decoration: BoxDecoration(
        // 2. Koyu modda düz yüzey rengi, açık modda hafif bir degrade
        gradient: LinearGradient(
          colors: isDark 
              ? [colorScheme.surface, colorScheme.surface] 
              : [colorScheme.surface, theme.cardColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        // 3. Sabit gri yerine temanın otomatik ayırıcı rengi
        border: Border.all(color: theme.dividerColor.withValues(alpha: 0.3), width: 1),
        boxShadow: [
          BoxShadow(
            // Koyu modda gölgeyi kapatıyoruz veya çok kısıyoruz ki kirli durmasın
            color: theme.shadowColor.withValues(alpha: isDark ? 0.0 : 0.05),
            blurRadius: 20,
            spreadRadius: 1,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  // 4. Sabit mor/mavi yerine temanın ana renklerinden gradient
                  gradient: LinearGradient(
                    colors: [colorScheme.primary, colorScheme.secondary],
                  ),
                ),
                child: CircleAvatar(
                  radius: 27,
                  // 5. Arka plan rengini temaya uydurduk
                  backgroundColor: colorScheme.surface,
                  child: Icon(
                    Icons.person,
                    size: 30,
                    color: colorScheme.primary, // İkon rengi
                  ),
                ),
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 14,
                  height: 14,
                  decoration: BoxDecoration(
                    color: Colors.green, // Aktif/Çevrimiçi noktası yeşil kalabilir
                    shape: BoxShape.circle,
                    // Noktanın etrafındaki çemberi de temanın zeminine uydurduk
                    border: Border.all(color: colorScheme.surface, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _greeting(),
                  style: TextStyle(
                    fontSize: 12,
                    // 6. Siyah/Gri yerine onSurface (Zemin üstü metin rengi) kullanıyoruz
                    color: colorScheme.onSurface.withValues(alpha: 0.6),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  name,
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface, // Karanlıkta otomatik beyaz, aydınlıkta siyah olur
                    letterSpacing: 0.2,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(
                      Icons.badge_outlined, 
                      size: 14, 
                      color: colorScheme.onSurface.withValues(alpha: 0.6)
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        department,
                        style: TextStyle(
                          fontSize: 13,
                          color: colorScheme.onSurface.withValues(alpha: 0.6),
                          fontWeight: FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
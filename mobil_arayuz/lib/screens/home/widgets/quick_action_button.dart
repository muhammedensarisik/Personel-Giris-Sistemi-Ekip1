import 'package:flutter/material.dart';

class QuickActionButton extends StatelessWidget {
  final String label;
  final String? subtitle; // Artık alt başlık da verebileceğiz
  final IconData icon;
  final Color color; 
  final VoidCallback onTap;

  const QuickActionButton({
    super.key,
    required this.label,
    this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            // Gündüz ve gece moduna uyumlu çerçeve rengi
            color: isDark ? Colors.grey.shade800 : Colors.grey.shade300, 
          ),
        ),
        child: Row(
          children: [
            // Sol İkon
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15), // İkonun arkasına kendi renginden çok hafif bir hava kattık (istersen transparent yapabilirsin)
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon, 
                color: color, 
                size: 22,
              ),
            ),
            const SizedBox(width: 16),
            
            // Orta Metin (Başlık ve Alt Başlık)
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  // Eğer subtitle gönderilmişse onu da ekranda çiz
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                      ),
                    ),
                  ]
                ],
              ),
            ),
            
            // Sağ Ok (Chevron)
            Icon(
              Icons.chevron_right_rounded,
              color: isDark ? Colors.white54 : Colors.black54,
            ),
          ],
        ),
      ),
    );
  }
}
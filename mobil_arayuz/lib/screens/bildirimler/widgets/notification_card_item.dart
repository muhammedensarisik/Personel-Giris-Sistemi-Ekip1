import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobil_arayuz/components/app_base_card.dart';
import 'package:mobil_arayuz/model/notification_model.dart';

class NotificationCardItem extends StatelessWidget {
  final NotificationModel notification;
  final bool isDark;
  final VoidCallback onTap;

  const NotificationCardItem({
    super.key,
    required this.notification,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isAdmin = notification.authorRole.toLowerCase() == "admin";
    final formattedDate = DateFormat('dd.MM.yyyy HH:mm').format(notification.createdAt);
    final isHighPriority = notification.priority.toLowerCase() == "yüksek" || 
      notification.priority.toLowerCase() == "yuksek";

    final Color cardColor = isAdmin ? Colors.redAccent : theme.colorScheme.primary;

    return AppBaseCard(
      isDark: isDark,
      badgeColor: cardColor,
      badgeText: isHighPriority ? "Önemli" : null,
      
      // Sol taraftaki ikon avatarı
      leadingIcon: CircleAvatar(
        backgroundColor: cardColor.withValues(alpha: 0.2),
        child: Icon(
          isAdmin ? Icons.admin_panel_settings : Icons.campaign,
          color: cardColor,
        ),
      ),
      
      // Ana başlık (Duyuru başlığı)
      title: notification.title,
      
      // Alt bilgi (Gönderen kişi ve tarih yan yana)
      subtitle: "Gönderen: ${notification.authorName}  •  $formattedDate",
      
      // Karta tıklandığında detay bottomsheet'ini açacak fonksiyon
      onTap: onTap,
    );
  }
}
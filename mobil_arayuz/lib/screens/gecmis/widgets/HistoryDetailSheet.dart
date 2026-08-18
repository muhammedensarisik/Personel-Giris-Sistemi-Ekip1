import 'package:flutter/material.dart';
import '../../../model/history_model.dart';

class HistoryDetailSheet extends StatelessWidget {
  final HistoryModel item;
  final String localizedStatus;
  final Color statusColor;
  final IconData statusIcon;
  final String durationText;

  const HistoryDetailSheet({
    super.key,
    required this.item,
    required this.localizedStatus,
    required this.statusColor,
    required this.statusIcon,
    required this.durationText,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.only(top: 12, left: 24, right: 24, bottom: 32),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey.shade900 : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min, // Sadece içeriği kadar yer kaplar
        children: [
          // En üstteki küçük tutma/kaydırma çubuğu
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 24),
            decoration: BoxDecoration(
              color: Colors.grey.shade400,
              borderRadius: BorderRadius.circular(10),
            ),
          ),
          
          // Durum İkonu ve Başlık
          CircleAvatar(
            radius: 32,
            backgroundColor: statusColor.withAlpha(30),
            child: Icon(statusIcon, color: statusColor, size: 32),
          ),
          const SizedBox(height: 16),
          Text(
            localizedStatus,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: statusColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            item.date,
            style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
          ),
          
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Divider(),
          ),

          // Detay Satırları
          _buildDetailRow(
            icon: Icons.login_rounded,
            iconColor: Colors.green,
            title: "Giriş Saati",
            value: item.checkIn,
          ),
          const SizedBox(height: 16),
          _buildDetailRow(
            icon: Icons.logout_rounded,
            iconColor: Colors.redAccent,
            title: "Çıkış Saati",
            value: item.checkOut == "--:--" ? "Henüz çıkış yapılmadı" : item.checkOut,
          ),
          const SizedBox(height: 16),
          _buildDetailRow(
            icon: Icons.timer_outlined,
            iconColor: Colors.blue,
            title: "Toplam Süre",
            value: item.checkOut == "--:--" ? "Hesaplanıyor..." : durationText,
          ),
          
          const SizedBox(height: 32),
          
          // Kapat Butonu
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text("Kapat", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  // Tekrarlanan detay satırlarını temiz yazmak için ufak bir yardımcı metod
  Widget _buildDetailRow({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withAlpha(20),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(width: 16),
        Text(
          title,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
        ),
        const Spacer(),
        Text(
          value,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
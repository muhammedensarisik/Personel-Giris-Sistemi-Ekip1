import 'package:flutter/material.dart';
import 'package:mobil_arayuz/components/app_base_card.dart';
import 'package:mobil_arayuz/screens/gecmis/widgets/HistoryDetailSheet.dart';
import '../../../model/history_model.dart';

class HistoryCard extends StatelessWidget {
  final HistoryModel item;

  const HistoryCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    // Tema modunu AppBaseCard için yakalıyoruz
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // 1. C#'tan Gelen Veriyi Türkçeleştirme ve Renklendirme Mantığı
    String localizedStatus = "Bilinmiyor";
    Color statusColor = Colors.grey;
    IconData statusIcon = Icons.help_outline;

    final String rawStatus = item.status.toLowerCase();

    if (item.checkOut == "--:--") {
      localizedStatus = "Mesai Devam Ediyor";
      statusColor = Colors.blue.shade600;
      statusIcon = Icons.sync;
    } else if (rawStatus == "ontime" || rawStatus == "tamamlandı") {
      localizedStatus = "Zamanında Geldi";
      statusColor = const Color(0xFF2E7D32); // Koyu Yeşil
      statusIcon = Icons.check_circle;
    } else if (rawStatus == "late" || rawStatus == "eksik") {
      localizedStatus = "Geç Kaldı";
      statusColor = const Color(0xFFC62828); // Kırmızı
      statusIcon = Icons.warning_amber_rounded;
    }

    // 2. Süre Hesaplaması (Dk'yı Saat ve Dk'ya çeviriyoruz)
    final int hours = item.duration ~/ 60;
    final int minutes = item.duration % 60;
    final String durationText = hours > 0 ? "$hours sa $minutes dk" : "$minutes dk";

    // 3. Ortak Şablonu Çağırıyoruz
    return AppBaseCard(
      isDark: isDark,
      badgeColor: statusColor,
      badgeText: localizedStatus,
      
      // Sol taraftaki Durum İkonu (Yuvarlak kare içinde)
      leadingIcon: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: statusColor.withValues(alpha: 0.15), 
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(statusIcon, color: statusColor, size: 24),
      ),
      
      // Ana başlık: Tarih
      title: item.date,
      
      // Alt Bilgi: Giriş Çıkış Saati ve Toplam Süre yan yana
      subtitle: "${item.checkIn} - ${item.checkOut}  •  $durationText",
      
      // Tıklanma Olayı: Detay Sayfası
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (context) => HistoryDetailSheet(
            item: item,
            localizedStatus: localizedStatus,
            statusColor: statusColor,
            statusIcon: statusIcon,
            durationText: durationText,
          ),
        );
      },
    );
  }
}
import 'package:flutter/material.dart';
import '../../../model/history_model.dart';

class HistoryCard extends StatelessWidget {
  final HistoryModel item;

  const HistoryCard({super.key, required this.item});

  @override
Widget build(BuildContext context) {
  final isCompleted = item.status == "Tamamlandı";
  final statusColor = isCompleted ? const Color(0xFF2E7D32) : const Color(0xFFC62828);

  return Container(
    margin: const EdgeInsets.only(bottom: 12),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: statusColor.withAlpha(20), // Arka plan yumuşak renk
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: statusColor.withAlpha(50), width: 1), // İnce şık bir kenarlık
      boxShadow: [
        BoxShadow(
          color: Colors.black.withAlpha(10),
          blurRadius: 10,
          offset: const Offset(0, 4),
        ),
      ],
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Sol ikon kısmı
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white.withAlpha(200), 
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(Icons.calendar_today, color: statusColor, size: 20),
        ),
        const SizedBox(width: 14),
        // Bilgi kısmı
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item.date,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 4),
              Text(
                "${item.checkIn} - ${item.checkOut}",
                style: TextStyle(fontSize: 13, color: Colors.grey.shade800),
              ),
            ],
          ),
        ),
        // Durum (Badge) kısmı
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: statusColor, // Badge'i tam renk yapıyoruz ki göze çarpsın
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            item.status,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ],
    ),
  );
}
}
import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/home/widgets/takvim/widgets/BlinkingEffect.dart'; // Yolunu kontrol et

class CalendarDayCell extends StatelessWidget {
  final int day;
  final String? status;
  final Color statusColor;
  final bool isToday;
  final bool isOffDay;

  const CalendarDayCell({
    super.key,
    required this.day,
    this.status,
    required this.statusColor,
    required this.isToday,
    required this.isOffDay,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    Widget cell = Container(
      decoration: BoxDecoration(
        color: isToday 
            ? Colors.blue.withValues(alpha: 0.15) 
            : statusColor.withValues(alpha: status == null ? 0.2 : 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isToday ? Colors.blue : statusColor,
          width: isToday ? 1.5 : (status == null ? 0.5 : 1.2),
        ),
      ),
      alignment: Alignment.center,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (isOffDay && status == null)
            Icon(Icons.close_rounded, color: Colors.red.withValues(alpha: 0.25), size: 32),
          Text(
            "$day",
            style: TextStyle(
              fontSize: 12,
              fontWeight: isToday ? FontWeight.bold : FontWeight.w600,
              color: isToday 
                  ? Colors.blue 
                  : (status == null ? colorScheme.onSurface.withValues(alpha: 0.6) : statusColor),
            ),
          ),
        ],
      ),
    );

    if (isToday) {
      return BlinkingEffect(child: cell);
    }
    
    return cell;
  }
}
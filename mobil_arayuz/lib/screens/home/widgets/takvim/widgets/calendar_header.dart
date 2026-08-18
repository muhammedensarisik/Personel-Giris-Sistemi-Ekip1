import 'package:flutter/material.dart';

class CalendarHeader extends StatelessWidget {
  final DateTime visibleMonth;
  final Function(int) onMonthChanged;

  const CalendarHeader({
    super.key,
    required this.visibleMonth,
    required this.onMonthChanged,
  });

  String _monthName(int month) {
    const names = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    return names[month - 1];
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        IconButton(
          onPressed: () => onMonthChanged(-1),
          icon: Icon(Icons.chevron_left_rounded, color: colorScheme.onSurface),
        ),
        Text(
          "${_monthName(visibleMonth.month)} ${visibleMonth.year}",
          style: TextStyle(
            fontWeight: FontWeight.w600, 
            fontSize: 15,
            color: colorScheme.onSurface, 
          ),
        ),
        IconButton(
          onPressed: () => onMonthChanged(1),
          icon: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface),
        ),
      ],
    );
  }
}
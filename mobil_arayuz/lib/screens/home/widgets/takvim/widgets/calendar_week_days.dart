import 'package:flutter/material.dart';

class CalendarWeekDays extends StatelessWidget {
  const CalendarWeekDays({super.key});

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Pzr"].map((day) {
        return Expanded(
          child: Center(
            child: Text(
              day,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface.withValues(alpha: 0.5),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
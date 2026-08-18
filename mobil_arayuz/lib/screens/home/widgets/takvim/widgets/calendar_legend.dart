import 'package:flutter/material.dart';

class CalendarLegend extends StatelessWidget {
  const CalendarLegend({super.key});

  Widget _buildLegendItem(BuildContext context, String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 10, 
          height: 10, 
          decoration: BoxDecoration(color: color, shape: BoxShape.circle)
        ),
        const SizedBox(width: 6),
        Text(
          label, 
          style: TextStyle(
            fontSize: 11, 
            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7),
          )
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildLegendItem(context, "Tamamlandı", Colors.green),
        const SizedBox(width: 16),
        _buildLegendItem(context, "Eksik", Colors.redAccent),
      ],
    );
  }
}
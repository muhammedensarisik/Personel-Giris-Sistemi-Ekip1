import 'package:flutter/material.dart';

class StatusProgressBar extends StatelessWidget {
  final double progress;
  final Color color;

  const StatusProgressBar({
    super.key,
    required this.progress,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: LinearProgressIndicator(
        value: progress.clamp(0.0, 1.0),
        minHeight: 8,
        // .withAlpha(30) yerine standart olması için .withOpacity kullandık
        backgroundColor: color.withOpacity(0.15),
        valueColor: AlwaysStoppedAnimation<Color>(color),
      ),
    );
  }
}
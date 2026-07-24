import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/home/widgets/quinckInfoBox.dart';

class QuickInfo extends StatelessWidget {
  final Duration totalDuration;
  final String checkIn;
  final String checkOut;
  final double? weeklyTrendPercent;

  const QuickInfo({
    super.key,
    this.totalDuration = const Duration(hours: 4, minutes: 30),
    this.checkIn = "08:00",
    this.checkOut = "17:30",
    this.weeklyTrendPercent,
  });

  String _formatDuration(Duration d) => "${d.inHours}s ${d.inMinutes % 60}dk";

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Expanded(
          child: QuickInfoBox(
            label: "Toplam Süre",
            value: _formatDuration(totalDuration),
            icon: Icons.timer_outlined,
            accentColor: Colors.deepPurple,
            trendPercent: weeklyTrendPercent,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: QuickInfoBox(
            label: "Giriş",
            value: checkIn,
            icon: Icons.login_rounded,
            accentColor: Colors.green,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: QuickInfoBox(
            label: "Çıkış",
            value: checkOut,
            icon: Icons.logout_rounded,
            accentColor: Colors.redAccent,
          ),
        ),
      ],
    );
  }
}
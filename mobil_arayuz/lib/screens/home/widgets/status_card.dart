import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/home/widgets/statusProgressbar.dart';

class StatusCard extends StatefulWidget {
  final bool isCheckedIn;
  final DateTime? checkInTime;
  final Duration targetDuration;

  const StatusCard({
    super.key,
    required this.isCheckedIn,
    this.checkInTime,
    this.targetDuration = const Duration(hours: 8),
  });

  @override
  State<StatusCard> createState() => _StatusCardState();
}

class _StatusCardState extends State<StatusCard> {
  Timer? _timer;
  Duration _elapsed = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateElapsed();
    _startTimerIfNeeded();
  }

  @override
  void didUpdateWidget(covariant StatusCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isCheckedIn != oldWidget.isCheckedIn ||
        widget.checkInTime != oldWidget.checkInTime) {
      _timer?.cancel();
      _updateElapsed();
      _startTimerIfNeeded();
    }
  }

  void _startTimerIfNeeded() {
    if (widget.isCheckedIn) {
      _timer = Timer.periodic(const Duration(seconds: 30), (_) => _updateElapsed());
    }
  }

  void _updateElapsed() {
    if (widget.isCheckedIn && widget.checkInTime != null) {
      setState(() => _elapsed = DateTime.now().difference(widget.checkInTime!));
    } else {
      setState(() => _elapsed = Duration.zero);
    }
  }

  String _formatElapsed(Duration d) {
    final hours = d.inHours;
    final minutes = d.inMinutes % 60;
    return "${hours}s ${minutes}dk";
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // 1. TEMAYI YAKALADIK
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    final Color mainColor = widget.isCheckedIn ? Colors.green : Colors.redAccent;
    final double progress = widget.targetDuration.inSeconds == 0
        ? 0.0
        : _elapsed.inSeconds / widget.targetDuration.inSeconds;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        // 2. GRADIENT AYARI: Koyu moddaysa kendi yüzey rengini, açıktaysa yine kendi yüzeyini alır (Beyazı sildik)
        gradient: LinearGradient(
          colors: [mainColor.withOpacity(0.1), colorScheme.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: mainColor.withOpacity(0.25)),
        boxShadow: [
          BoxShadow(
            // Koyu modda gölgeyi daha yumuşak yapıyoruz ki kirli durmasın
            color: mainColor.withOpacity(isDark ? 0.05 : 0.15),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: mainColor.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    widget.isCheckedIn ? Icons.check_circle_rounded : Icons.cancel_rounded,
                    color: mainColor,
                    size: 32,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Bugünkü Durum",
                        style: TextStyle(
                          fontSize: 13,
                          // 3. Sabit Gri yerine temanın metin renginin saydam hali
                          color: colorScheme.onSurface.withOpacity(0.6),
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.isCheckedIn ? "Mesai Başlatıldı" : "Mesai Başlatılmadı",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: mainColor, // Yeşil veya kırmızı renk her iki temada da kalmalı
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: mainColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    widget.isCheckedIn ? "Aktif" : "Pasif",
                    style: const TextStyle(
                      // Arka planı koyu yeşil/kırmızı olduğu için buradaki beyaz yazı kalabilir!
                      color: Colors.white, 
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            if (widget.isCheckedIn && widget.checkInTime != null) ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Icon(Icons.hourglass_bottom_rounded, size: 14, color: mainColor),
                  const SizedBox(width: 6),
                  Text(
                    "${_formatElapsed(_elapsed)} çalışıyorsun",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      // 4. Sabit Koyu Gri yerine temanın belirgin metin rengi
                      color: colorScheme.onSurface.withOpacity(0.8),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              StatusProgressBar(progress: progress, color: mainColor),
            ],
          ],
        ),
      ),
    );
  }
}
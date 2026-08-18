import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobil_arayuz/components/app_base_card.dart';
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
      // Sayacı her 1 dakikada bir güncellemek performansı artırır (Saniye göstermiyoruz sonuçta)
      _timer = Timer.periodic(const Duration(minutes: 1), (_) => _updateElapsed());
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
    // Saat 0 ise sadece dakikayı göster, daha temiz durur
    if (hours == 0) return "$minutes dk";
    return "$hours sa $minutes dk";
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Renkleri biraz daha soft ve modern tonlara çektik
    final Color mainColor = widget.isCheckedIn ? const Color(0xFF10B981) : const Color(0xFFEF4444);
    final double progress = widget.targetDuration.inSeconds == 0
        ? 0.0
        : _elapsed.inSeconds / widget.targetDuration.inSeconds;

    return AppBaseCard(
      isDark: isDark,
      badgeColor: mainColor,
      badgeText: widget.isCheckedIn ? "Aktif" : "Pasif",
      
      leadingIcon: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: mainColor.withValues(alpha: 0.15),
          shape: BoxShape.circle,
        ),
        child: Icon(
          widget.isCheckedIn ? Icons.work_history_rounded : Icons.power_settings_new_rounded,
          color: mainColor,
          size: 28,
        ),
      ),
      
      title: widget.isCheckedIn ? "Mesai Devam Ediyor" : "Mesai Dışı",
      subtitle: widget.isCheckedIn 
          ? "Günlük çalışma süreniz işleniyor" 
          : "Şu an sistemde aktif değilsiniz",
      
      onTap: () {},
      
      // KARTIN ALT KISMI (Boş bırakmak yerine her duruma özel tasarım yaptık)
      bottomChild: Container(
        margin: const EdgeInsets.only(top: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isDark ? Colors.black26 : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: widget.isCheckedIn 
                ? mainColor.withValues(alpha: 0.3) 
                : (isDark ? Colors.grey.shade800 : Colors.grey.shade200),
          ),
        ),
        child: widget.isCheckedIn && widget.checkInTime != null
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.timer_outlined, size: 16, color: mainColor),
                          const SizedBox(width: 6),
                          Text(
                            "Geçen Süre",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        _formatElapsed(_elapsed),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: mainColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  StatusProgressBar(progress: progress, color: mainColor),
                ],
              )
            : Row(
                children: [
                  Icon(Icons.qr_code_scanner_rounded, size: 16, color: Colors.grey.shade500),
                  const SizedBox(width: 8),
                  Text(
                    "QR kodu okutarak mesaiye başlayın.",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
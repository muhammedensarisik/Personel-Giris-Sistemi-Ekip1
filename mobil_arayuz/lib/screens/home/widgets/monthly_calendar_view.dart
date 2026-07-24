import 'package:flutter/material.dart';
import 'package:mobil_arayuz/services/historyService.dart';

class MonthlyCalendarView extends StatefulWidget {
  const MonthlyCalendarView({super.key});

  @override
  State<MonthlyCalendarView> createState() => _MonthlyCalendarViewState();
}

class _MonthlyCalendarViewState extends State<MonthlyCalendarView> {
  final HistoryService _service = HistoryService();
  DateTime _visibleMonth = DateTime(DateTime.now().year, DateTime.now().month);
  Map<String, String> _statusByDate = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() => _isLoading = true);
    final data = await _service.fetchHistory();

    if (!mounted) return;

    setState(() {
      _statusByDate = {for (final item in data) item.date.trim(): item.status};
      _isLoading = false;
    });
  }

  void _changeMonth(int delta) {
    setState(() {
      _visibleMonth = DateTime(_visibleMonth.year, _visibleMonth.month + delta);
    });
  }

  // Temaya (koyu/açık) göre renkleri daha şık ayarlamak için isDark parametresi ekledik
  Color _colorForStatus(String? status, bool isDark) {
    if (status == "Tamamlandı") return Colors.green;
    if (status == "Eksik") return Colors.redAccent;
    // Boş günler için koyu modda daha koyu bir gri, açık modda açık gri döner
    return isDark ? Colors.grey.shade800 : Colors.grey.shade300; 
  }

  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}";
  }

  String _monthName(int month) {
    const names = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    return names[month - 1];
  }

  @override
  Widget build(BuildContext context) {
    // TEMAYI YAKALADIK
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    final firstDayOfMonth = DateTime(_visibleMonth.year, _visibleMonth.month, 1);
    final daysInMonth = DateTime(_visibleMonth.year, _visibleMonth.month + 1, 0).day;
    final leadingEmptyDays = (firstDayOfMonth.weekday - 1) % 7;

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        // İŞTE SENİN HATAYI ÇÖZEN SATIR: Arka plan rengini açıkça belirttik!
        color: colorScheme.surface, 
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            // Koyu modda gölge kapalı (0.0), açık modda çok hafif gölge (0.05)
            color: theme.shadowColor.withValues(alpha: isDark ? 0.0 : 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: () => _changeMonth(-1),
                icon: Icon(Icons.chevron_left_rounded, color: colorScheme.onSurface),
              ),
              Text(
                "${_monthName(_visibleMonth.month)} ${_visibleMonth.year}",
                style: TextStyle(
                  fontWeight: FontWeight.w600, 
                  fontSize: 15,
                  color: colorScheme.onSurface, // Karanlıkta beyaz, aydınlıkta siyah yazar
                ),
              ),
              IconButton(
                onPressed: () => _changeMonth(1),
                icon: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: CircularProgressIndicator(),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                mainAxisSpacing: 6,
                crossAxisSpacing: 6,
              ),
              itemCount: leadingEmptyDays + daysInMonth,
              itemBuilder: (context, index) {
                if (index < leadingEmptyDays) return const SizedBox();
                final day = index - leadingEmptyDays + 1;
                final date = DateTime(_visibleMonth.year, _visibleMonth.month, day);
                final status = _statusByDate[_formatDate(date)];
                
                final statusColor = _colorForStatus(status, isDark);

                return Container(
                  decoration: BoxDecoration(
                    // Boş günlerde daha belirgin olması için saydamlık oranlarını ayarladık
                    color: statusColor.withValues(alpha: status == null ? 0.2 : 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: statusColor,
                      width: status == null ? 0.5 : 1.2,
                    ),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    "$day",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      // Boş günlerin sayısını yazarken temaya uygun yazı rengi kullanıyoruz
                      color: status == null 
                          ? colorScheme.onSurface.withValues(alpha: 0.6) 
                          : statusColor,
                    ),
                  ),
                );
              },
            ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegend(context, "Tamamlandı", Colors.green),
              const SizedBox(width: 16),
              _buildLegend(context, "Eksik", Colors.redAccent),
            ],
          ),
        ],
      ),
    );
  }

  // Legend metoduna da context gönderdik ki yazıları temaya uysun
  Widget _buildLegend(BuildContext context, String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
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
}
import 'package:flutter/material.dart';
import 'calendar_day_cell.dart';

class CalendarGrid extends StatelessWidget {
  final DateTime visibleMonth;
  final Map<String, String> statusByDate;

  const CalendarGrid({
    super.key,
    required this.visibleMonth,
    required this.statusByDate,
  });

  String _formatDate(DateTime date) {
    return "${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}";
  }

  bool _isHoliday(DateTime date) {
    if (date.weekday == 6 || date.weekday == 7) return true;
    final holidays = ["01-01", "23-04", "01-05", "19-05", "15-07", "30-08", "29-10"];
    final dateString = "${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}";
    return holidays.contains(dateString);
  }

  Color _colorForStatus(String? status, bool isDark) {
    if (status == null) return isDark ? Colors.grey.shade800 : Colors.grey.shade300;
    
    final rawStatus = status.toLowerCase();
    if (rawStatus == "ontime" || rawStatus == "tamamlandı") return const Color(0xFF2E7D32);
    if (rawStatus == "late" || rawStatus == "eksik") return const Color(0xFFC62828);
    
    return isDark ? Colors.grey.shade800 : Colors.grey.shade300; 
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final firstDayOfMonth = DateTime(visibleMonth.year, visibleMonth.month, 1);
    final daysInMonth = DateTime(visibleMonth.year, visibleMonth.month + 1, 0).day;
    final leadingEmptyDays = (firstDayOfMonth.weekday - 1) % 7;
    final now = DateTime.now();

    return GridView.builder(
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
        final date = DateTime(visibleMonth.year, visibleMonth.month, day);
        final status = statusByDate[_formatDate(date)];
        final statusColor = _colorForStatus(status, isDark);
        
        final isToday = date.year == now.year && date.month == now.month && date.day == now.day;
        final isOffDay = _isHoliday(date);

        return CalendarDayCell(
          day: day,
          status: status,
          statusColor: statusColor,
          isToday: isToday,
          isOffDay: isOffDay,
        );
      },
    );
  }
}
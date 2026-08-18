import 'package:flutter/material.dart';
import 'package:mobil_arayuz/model/history_model.dart';
import 'package:mobil_arayuz/screens/home/widgets/takvim/widgets/calendar_grid.dart';
import 'package:mobil_arayuz/screens/home/widgets/takvim/widgets/calendar_header.dart';
import 'package:mobil_arayuz/screens/home/widgets/takvim/widgets/calendar_legend.dart';
import 'package:mobil_arayuz/screens/home/widgets/takvim/widgets/calendar_week_days.dart';


class MonthlyCalendarView extends StatefulWidget {
  final List<HistoryModel> historyList;

  const MonthlyCalendarView({
    super.key,
    required this.historyList,
  });

  @override
  State<MonthlyCalendarView> createState() => _MonthlyCalendarViewState();
}

class _MonthlyCalendarViewState extends State<MonthlyCalendarView> {
  DateTime _visibleMonth = DateTime(DateTime.now().year, DateTime.now().month);
  Map<String, String> _statusByDate = {};

  @override
  void initState() {
    super.initState();
    _mapHistoryToDates();
  }

  @override
  void didUpdateWidget(covariant MonthlyCalendarView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.historyList != oldWidget.historyList) {
      _mapHistoryToDates();
    }
  }

  void _mapHistoryToDates() {
    setState(() {
      _statusByDate = {
        for (final item in widget.historyList) item.date.trim(): item.status
      };
    });
  }

  void _changeMonth(int delta) {
    setState(() {
      _visibleMonth = DateTime(_visibleMonth.year, _visibleMonth.month + delta);
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: colorScheme.surface, 
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withValues(alpha: isDark ? 0.0 : 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          CalendarHeader(
            visibleMonth: _visibleMonth,
            onMonthChanged: _changeMonth,
          ),
          const SizedBox(height: 8),
          
          const CalendarWeekDays(),
          const SizedBox(height: 8),

          CalendarGrid(
            visibleMonth: _visibleMonth,
            statusByDate: _statusByDate,
          ),
          const SizedBox(height: 12),

          const CalendarLegend(),
        ],
      ),
    );
  }
}
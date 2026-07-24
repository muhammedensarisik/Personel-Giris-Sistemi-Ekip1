import 'package:flutter/material.dart';

class HistoryAppBar extends StatelessWidget implements PreferredSizeWidget {
  final DateTime? selectedDate;
  final VoidCallback onDateTap;
  final VoidCallback onDateClear;
  final ValueChanged<String> onFilterSelected;

  const HistoryAppBar({
    super.key,
    required this.selectedDate,
    required this.onDateTap,
    required this.onDateClear,
    required this.onFilterSelected,
  });

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text(
        "Geçmiş Mesai Kayıtları",
        style: TextStyle(fontWeight: FontWeight.w600),
      ),
      elevation: 0,
      centerTitle: true,
      actions: [
        GestureDetector(
          onTap: onDateTap,
          onLongPress: onDateClear,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Icon(
              Icons.calendar_today,
              color: selectedDate == null ? Colors.black87 : Colors.blue,
            ),
          ),
        ),
        PopupMenuButton<String>(
          icon: const Icon(Icons.filter_list),
          onSelected: onFilterSelected,
          itemBuilder: (context) => const [
            PopupMenuItem(value: "Tümü", child: Text("Tümü")),
            PopupMenuItem(value: "Tamamlandı", child: Text("Gelinmiş")),
            PopupMenuItem(value: "Eksik", child: Text("Gelinmeyen")),
          ],
        ),
      ],
    );
  }
}
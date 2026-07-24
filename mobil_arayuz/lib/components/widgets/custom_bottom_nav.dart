import 'package:flutter/material.dart';
import 'package:mobil_arayuz/model/nav_model.dart';

class CustomBottomNav extends StatelessWidget {
  final List<NavItem> items;
  final int currentIndex;
  final Function(int) onTap;

  const CustomBottomNav({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 12,
        bottom: MediaQuery.of(context).padding.bottom + 12,
      ),
        decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface, 
        
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10), 
            blurRadius: 20, 
            offset: const Offset(0, -5)
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(items.length, (index) {
          final isSelected = currentIndex == index;
          final item = items[index];

          return InkWell(
            onTap: () => onTap(index),
            child: Column( // ROW YERİNE COLUMN KULLANDIK (İsim altına geçti)
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  item.icon,
                  size: 24,
                  color: isSelected ? const Color(0xFF1565C0) : Colors.grey.shade500,
                ),
                const SizedBox(height: 2.5), 
                Text(
                  item.label,
                  style: TextStyle(
                    color: isSelected ? const Color(0xFF1565C0) : Colors.grey.shade500,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 11, // Yazı boyutu
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
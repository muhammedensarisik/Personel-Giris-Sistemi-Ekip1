import 'package:flutter/material.dart';
import 'package:mobil_arayuz/components/app_navbar.dart';
import 'package:mobil_arayuz/components/widgets/custom_bottom_nav.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  final _navItems = AppNavbar.getItems();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: _navItems[_currentIndex].page,
      
      bottomNavigationBar: CustomBottomNav(
        items: _navItems,
        currentIndex: _currentIndex,
        onTap: (index) {
          if (mounted) {
          setState(() {
            _currentIndex = index;
          });
        }
        },
      ),
    );
  }
}
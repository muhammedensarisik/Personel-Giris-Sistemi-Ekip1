import 'package:flutter/material.dart';

class NavItem {
  final String label;
  final IconData icon;
  final Widget page;

  NavItem({required this.label, required this.icon, required this.page});
}
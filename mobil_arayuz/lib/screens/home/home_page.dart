import 'package:flutter/material.dart';
import 'package:mobil_arayuz/components/curve_clipper.dart';
import 'package:mobil_arayuz/screens/home/widgets/profile_header.dart';
import 'package:mobil_arayuz/screens/home/widgets/quick_info.dart';
import 'package:mobil_arayuz/screens/home/widgets/status_card.dart';
import 'package:mobil_arayuz/screens/home/widgets/quick_actions_bar.dart';
import 'package:mobil_arayuz/screens/home/widgets/monthly_calendar_view.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          ClipPath(
            clipper: HeaderCurveClipper(),
            child: Container(
              height: 280,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1565C0), Color(0xFF1E88E5)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  const ProfileHeader(name: "Ahmet Yılmaz", department: "Yazılım Departmanı"),
                  const SizedBox(height: 20),
                  StatusCard(
                    isCheckedIn: true,
                    checkInTime: DateTime.now().subtract(const Duration(hours: 2, minutes: 14)),
                  ),
                  const SizedBox(height: 20),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: QuickInfo(weeklyTrendPercent: 5),
                  ),
                  const SizedBox(height: 24),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: QuickActionsBar(),
                  ),
                  const SizedBox(height: 24),
                  const MonthlyCalendarView(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
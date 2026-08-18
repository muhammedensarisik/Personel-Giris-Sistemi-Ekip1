import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; // Tarih formatlamak için gerekli
import 'package:mobil_arayuz/screens/home/widgets/announcement_banner_widget.dart';
import 'package:mobil_arayuz/services/attendance_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobil_arayuz/services/api_service.dart'; 
import 'package:mobil_arayuz/services/historyService.dart';
import 'package:mobil_arayuz/model/history_model.dart'; 
import 'package:mobil_arayuz/components/curve_clipper.dart';
import 'package:mobil_arayuz/screens/home/widgets/profile_header.dart';
import 'package:mobil_arayuz/screens/home/widgets/quick_info.dart';
import 'package:mobil_arayuz/screens/home/widgets/status_card.dart';
import 'package:mobil_arayuz/screens/home/widgets/talepler/quick_actions_bar.dart';
import 'package:mobil_arayuz/screens/home/widgets/takvim/monthly_calendar_view.dart';
import 'package:mobil_arayuz/services/holiday_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String userName = "Yükleniyor...";
  String userDepartment = "Bekleniyor...";
  bool isLoading = true;
  late Future<Map<String, dynamic>> _attendanceFuture;
  
  List<HistoryModel> myHistory = []; 

  Map<String, dynamic>? upcomingHoliday;
  bool isLoadingHoliday = true;

  @override
  void initState() {
    super.initState();
    fetchMyProfile();
    fetchMyHistory(); 
    fetchHoliday();
    _fetchData();
  }

  void _fetchData() {
    setState(() {
      _attendanceFuture = AttendanceService().getTodayAttendanceStatus();
    });
  }

  Future<void> fetchHoliday() async {
    try {
      final holiday = await HolidayService().fetchUpcomingHoliday();
      if (!mounted) return;
      setState(() {
        upcomingHoliday = holiday;
        isLoadingHoliday = false;
      });
    } catch (e) {
      debugPrint("Tatil verisi çekilemedi: $e");
      if (mounted) {
        setState(() {
          isLoadingHoliday = false;
        });
      }
    }
  }

  Future<void> fetchMyProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      String? myUserId = prefs.getString('userId');

      if (!mounted) return;
      
      if (myUserId == null) {
        setState(() {
          userName = "Oturum Hatası";
          isLoading = false;
        });
        return; 
      }

      final response = await ApiService().dio.get('/personnel/my-profile/$myUserId');
      
      if (!mounted) return;

      if (response.statusCode == 200) {
        setState(() {
          userName = response.data['fullName'] ?? prefs.getString('userFullName') ?? 'Kullanıcı';
          userDepartment = response.data['department'] ?? 'Departman Yok';
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Profil çekilirken hata oluştu: $e");
      
      if (!mounted) return; 
      
      setState(() {
        final prefs = SharedPreferences.getInstance();
        prefs.then((p) => userName = p.getString('userFullName') ?? "Bağlantı Hatası");
        userDepartment = "Çevrimdışı";
        isLoading = false;
      });
    }
  }

  Future<void> fetchMyHistory() async {
    try {
      final historyData = await HistoryService().fetchHistory();
      if (!mounted) return;
      setState(() {
        myHistory = historyData;
      });
    } catch (e) {
      debugPrint("Takvim geçmişi çekilemedi: $e");
    }
  }

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
            child: FutureBuilder<Map<String, dynamic>>(
              future: _attendanceFuture,
              builder: (context, snapshot) {
                // Veriler yüklenirken alt kısımda loading gösterebiliriz
                final data = snapshot.data ?? {};
                bool isCheckedIn = data["isCheckedIn"] ?? false;
                DateTime? checkInTime = data["checkInTime"];
                String checkInFormatted = data["checkInFormatted"] ?? "--:--";
                String checkOutFormatted = data["checkOutFormatted"] ?? "--:--";
                Duration totalDuration = data["totalDuration"] ?? Duration.zero;

                return SingleChildScrollView(
                  child: Column(
                    children: [
                      ProfileHeader(
                        name: userName, 
                        department: userDepartment
                      ),
                      const SizedBox(height: 20),
                      
                      // --- DİNAMİK MESAİ KARTI (Servisten gelen gerçek veriler) ---
                      StatusCard(
                        isCheckedIn: isCheckedIn,
                        checkInTime: checkInTime,
                      ),
                      const SizedBox(height: 20),
                      
                      // --- DİNAMİK BİLGİ KUTULARI (Giriş, Çıkış, Toplam Süre) ---
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: QuickInfo(
                          totalDuration: totalDuration,
                          checkIn: checkInFormatted,
                          checkOut: checkOutFormatted,
                          weeklyTrendPercent: 5,
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        child: QuickActionsBar(),
                      ),
                      const SizedBox(height: 10),

                      if (!isLoadingHoliday && upcomingHoliday != null)
                        Column(
                          children: [
                            AnnouncementBannerWidget(
                              title: upcomingHoliday!['name'] ?? upcomingHoliday!['Name'] ?? "Özel Gün",
                              dateStr: DateFormat('dd.MM.yyyy').format(
                                DateTime.parse(upcomingHoliday!['date'] ?? upcomingHoliday!['Date'])
                              ),
                              type: upcomingHoliday!['type'] ?? upcomingHoliday!['Type'] ?? "Tam Gün",
                            ),
                            const SizedBox(height: 24),
                          ],
                        ),

                      MonthlyCalendarView(historyList: myHistory), 
                      const SizedBox(height: 20),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
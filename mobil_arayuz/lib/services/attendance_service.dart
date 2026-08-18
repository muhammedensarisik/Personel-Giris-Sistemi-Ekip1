import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobil_arayuz/services/api_service.dart';

class AttendanceService {
  Future<Map<String, dynamic>> getTodayAttendanceStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final String userId = prefs.getString('userId') ?? '';

    if (userId.isEmpty) {
      return _emptyResponse();
    }

    try {
      // Projedeki çalışan Dio yapısını (ApiService) kullanıyoruz
      final response = await ApiService().dio.get(
        '/Attendance/my-history/$userId',
        options: Options(
          headers: {
            "X-User-Id": userId,
            "X-User-Role": "User",
          },
        ),
      );

      if (response.statusCode == 200) {
        // Dio, veriyi otomatik jsonDecode yapar (response.data doğrudan listelidir)
        List<dynamic> data = response.data;
        
        if (data.isNotEmpty) {
          // Çıkışı yapılmamış (aktif) mesaiyi arıyoruz
          var activeAttendance = data.firstWhere(
            (item) => item['checkOutTime'] == null,
            orElse: () => null,
          );

          // Aktif mesai varsa onu, yoksa en son kaydı baz al
          var targetRecord = activeAttendance ?? data.first;

          String? checkInStr = targetRecord['checkInTime'];
          String? checkOutStr = targetRecord['checkOutTime'];

          DateTime? checkInTime = checkInStr != null ? DateTime.parse(checkInStr).toLocal() : null;
          DateTime? checkOutTime = checkOutStr != null ? DateTime.parse(checkOutStr).toLocal() : null;

          bool isCheckedIn = (checkInTime != null && checkOutTime == null);

          Duration totalDuration = Duration.zero;
          if (checkInTime != null) {
            final endTime = checkOutTime ?? DateTime.now();
            totalDuration = endTime.difference(checkInTime);
          }

          return {
            "isCheckedIn": isCheckedIn,
            "checkInTime": checkInTime,
            "checkInFormatted": checkInTime != null ? "${checkInTime.hour.toString().padLeft(2, '0')}:${checkInTime.minute.toString().padLeft(2, '0')}" : "--:--",
            "checkOutFormatted": checkOutTime != null ? "${checkOutTime.hour.toString().padLeft(2, '0')}:${checkOutTime.minute.toString().padLeft(2, '0')}" : "Devam Ediyor",
            "totalDuration": totalDuration,
          };
        }
      }
    } catch (e) {
      print("AttendanceService Hata: $e");
    }

    return _emptyResponse();
  }

  Map<String, dynamic> _emptyResponse() {
    return {
      "isCheckedIn": false,
      "checkInTime": null,
      "checkInFormatted": "--:--",
      "checkOutFormatted": "--:--",
      "totalDuration": Duration.zero,
    };
  }
}
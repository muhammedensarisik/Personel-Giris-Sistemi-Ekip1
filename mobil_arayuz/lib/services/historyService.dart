import 'package:dio/dio.dart'; // Options sınıfı için bu import şart
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobil_arayuz/services/api_service.dart';
import 'package:mobil_arayuz/model/history_model.dart';

class HistoryService {
  Future<List<HistoryModel>> fetchHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = prefs.getString('userId');
      final String? userRole = prefs.getString('userRole') ?? 'User'; // Rolü de çektik

      if (userId == null) {
        throw Exception("Kullanıcı oturumu bulunamadı."); 
      }

      // İŞTE EKSİK OLAN KISIM: Header'ları gönderiyoruz
      final response = await ApiService().dio.get(
        '/attendance/my-history/$userId',
        options: Options(
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
          },
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => HistoryModel.fromJson(json)).toList();
      } else {
        throw Exception("Sunucudan beklenmeyen bir yanıt geldi. Kod: ${response.statusCode}");
      }
    } catch (e) {
      throw Exception("Geçmiş çekilirken hata oluştu: $e");
    }
  }
}
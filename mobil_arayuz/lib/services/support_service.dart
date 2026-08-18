import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobil_arayuz/services/api_service.dart'; // Projendeki Dio servisinin yolu

class SupportService {
  final Dio _dio = ApiService().dio;

  Future<bool> createSupportTicket({
    required String targetManagerId,
    required String subject,
    required String message,
    String? imagePath,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // DİKKAT: Giriş yaparken kullandığın key neyse burada o yazmalı! 
      // Eğer login ekranında 'id' olarak kaydettiysen burayı prefs.getString('id') yapmalısın.
      final String? userId = prefs.getString('userId'); 

      print("DEBUG - SharedPreferences'tan gelen userId: $userId");

      if (userId == null) {
        print("HATA: userId null! Kullanıcı oturumu SharedPreferences'ta bulunamadı.");
        return false;
      }

      print("DEBUG - Gönderilen Veriler: personnelId=$userId, targetManagerId=$targetManagerId");

      final response = await _dio.post('/SupportTickets', data: {
        "personnelId": userId,          
        "targetManagerId": targetManagerId, 
        "subject": subject,
        "message": message,
        "imagePath": imagePath,
      });

      print("DEBUG - Backend Yanıt Kodu: ${response.statusCode}");
      return response.statusCode == 200 || response.statusCode == 201;
      
    } catch (e) {
      if (e is DioException) {
        print("DIO HATA KODU: ${e.response?.statusCode}");
        print("DIO HATA MESAJI: ${e.response?.data}");
      } else {
        print("BİLİNMEYEN HATA: $e");
      }
      return false;
    }
  }


  Future<List<dynamic>> getMySupportTickets() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final String? userId = prefs.getString('userId');

    if (userId == null) return [];

    final response = await _dio.get('/SupportTickets/my-tickets/$userId');

    if (response.statusCode == 200 && response.data is List) {
      return response.data;
    }
    return [];
  } catch (e) {
    print("Destek talepleri çekilemedi: $e");
    return [];
  }
  }

  Future<List<Map<String, dynamic>>> fetchSupportTargets() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    final String? userId = prefs.getString('userId');

    print("Giriş yapan UserId: $userId"); // Konsoldan ID'nin gelip gelmediğine kesin bak!

    if (userId == null) return [];

    final response = await _dio.get('/Personnel/support-targets/$userId'); 

    print("Backend'den Gelen Yanıt: ${response.data}"); // Gelen ham veriyi konsola bas

    if (response.statusCode == 200 && response.data is List) {
      return (response.data as List).map((item) {
        return {
          'id': item['id'] ?? item['Id'],
          // C# PascalCase mi yoksa camelCase mi döndürürse döndürsün yakalıyoruz:
          'fullName': item['fullName'] ?? item['FullName'] ?? item['full_name'] ?? item['name'] ?? item['Name'] ?? 'Yetkili',
          'role': item['role'] ?? item['Role'] ?? 'Yönetici',
        };
      }).toList();
    }
    return [];
  } catch (e) {
    print("Destek hedefleri çekilemedi HATA: $e");
    return [];
  }
}
}
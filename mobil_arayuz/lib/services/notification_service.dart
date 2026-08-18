import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobil_arayuz/services/api_service.dart';
import 'package:mobil_arayuz/model/notification_model.dart'; // Modelinin doğru yolu

class NotificationService {
  // Metot adını fetchNotifications yaptık, daha anlaşılır oldu
  Future<List<NotificationModel>> fetchNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Kullanıcının kimlik bilgilerini SharedPreferences'tan çekiyoruz
      final String? userId = prefs.getString('userId');
      final String? userRole = prefs.getString('userRole') ?? 'User'; // Yoksa standart User say
      final String? managerId = prefs.getString('managerId'); 

      if (userId == null) {
        throw Exception("Oturum bulunamadı, lütfen tekrar giriş yapın.");
      }

      final response = await ApiService().dio.get(
        '/Announcement',
        options: Options(
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
            'X-User-Manager-Id': managerId ?? "",
          },
        ),
      );

      // C# tarafı Ok() dönerse 200 kodunu alırız
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => NotificationModel.fromJson(json)).toList();
      } else {
        throw Exception("Bildirimler yüklenemedi. Sunucu Yanıtı: ${response.statusCode}");
      }
    } catch (e) {
      throw Exception("Sunucuya bağlanılamadı: $e");
    }
  }
}
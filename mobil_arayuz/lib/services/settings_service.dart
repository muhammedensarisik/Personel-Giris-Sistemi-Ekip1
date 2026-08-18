import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobil_arayuz/services/api_service.dart';

class SettingsService {
  
  // 1. İLETİŞİM BİLGİLERİNİ GÜNCELLEME
  Future<bool> updateContactInfo(String email, String phone) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = prefs.getString('userId');
      final String? userRole = prefs.getString('userRole') ?? 'User';

      if (userId == null) throw Exception("Kullanıcı oturumu bulunamadı.");

      // /api BAŞTAN SİLİNDİ (Çünkü ApiService zaten baseUrl içinde /api veriyor)
      final response = await ApiService().dio.put(
        '/profile/update-contact/$userId',
        data: {
          'email': email,
          'phoneNumber': phone,
        },
        options: Options(
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
          },
        ),
      );

      if (response.statusCode == 200) {
        return true; 
      }
      return false;
    } catch (e) {
      throw Exception("Bilgiler güncellenirken hata oluştu: $e");
    }
  }

  // 2. PROFİLİ GETİR
  Future<Map<String, dynamic>> fetchProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = prefs.getString('userId');
      final String? userRole = prefs.getString('userRole') ?? 'User';

      if (userId == null) throw Exception("Kullanıcı oturumu bulunamadı.");

      // /api BAŞTAN SİLİNDİ
      final response = await ApiService().dio.get(
        '/profile/me/$userId',
        options: Options(
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
          },
        ),
      );

      if (response.statusCode == 200) {
        return response.data; 
      } else {
        throw Exception("Profil bilgileri alınamadı.");
      }
    } catch (e) {
      throw Exception("Bağlantı hatası: $e");
    }
  }

  // 3. ŞİFRE DEĞİŞTİRME
  Future<bool> changePassword(String oldPassword, String newPassword) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? userId = prefs.getString('userId');
      final String? userRole = prefs.getString('userRole') ?? 'User';

      if (userId == null) throw Exception("Kullanıcı oturumu bulunamadı.");

      // /api BAŞTAN SİLİNDİ
      final response = await ApiService().dio.post(
        '/auth/change-password',
        data: {
          'userId': userId,
          'oldPassword': oldPassword,
          'newPassword': newPassword,
        },
        options: Options(
          headers: {
            'X-User-Id': userId,
            'X-User-Role': userRole,
          },
        ),
      );

      if (response.statusCode == 200) {
        return true; 
      }
      return false;
    } on DioException catch (e) {
      final errorMessage = e.response?.data['message'] ?? "Şifre değiştirilemedi. Sunucu hatası.";
      throw Exception(errorMessage);
    } catch (e) {
      throw Exception("Beklenmeyen bir hata oluştu: $e");
    }
  }

  // 4. ÇIKIŞ YAPMA
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); 
  }
}
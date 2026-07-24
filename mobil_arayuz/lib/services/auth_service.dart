import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart'; // Ana servisimizi içeri aktardık

class AuthService {
  // Ana servisteki dio nesnesine ulaşıyoruz
  final Dio _dio = ApiService().dio;

  // Başarılı olursa null, hata olursa hata mesajı (String) döner
  Future<String?> login(String email, String password) async {
    try {
        final response = await _dio.post(
        '/auth/login-mobile', // SADECE BURAYI DEĞİŞTİRİYORUZ
        data: {
          'email': email.trim(),
          'passwordHash': password, 
        },
      );

      if (response.statusCode == 200 && response.data != null) {
        final userData = response.data['data'] ?? response.data;
        
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('userId', userData['id'].toString());
        await prefs.setString('userFullName', userData['fullName'] ?? 'Kullanıcı');
        await prefs.setString('userRole', userData['role'] ?? 'User');

        return null; // Başarılı
      }
      return "Giriş başarısız.";
    } on DioException catch (e) {
      if (e.response != null && e.response?.data != null) {
         final errorMsg = e.response?.data['error'] ?? e.response?.data['message'];
         if (errorMsg != null) return errorMsg.toString();
      }
      return "Sunucuya bağlanılamadı. IP adresini kontrol edin.";
    } catch (e) {
      return "Beklenmeyen bir hata oluştu.";
    }
  }


  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
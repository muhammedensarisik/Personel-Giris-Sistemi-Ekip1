import 'package:dio/dio.dart';
import 'api_service.dart'; // Kendi ApiService dosyanın yolunu doğru ver

class QrService {
  final Dio _dio = ApiService().dio;

  // --- QR VE KONUM DOĞRULAMA İSTEĞİ ---
  Future<Response> sendQrScanData(Map<String, dynamic> data) async {
    try {
      // Sadece endpoint'i yazmamız yeterli, baseUrl zaten ApiService'ten geliyor
      final response = await _dio.post('/QrAttendance/scan', data: data);
      return response;
    } on DioException catch (e) {
      if (e.response != null && e.response?.data != null) {
        throw Exception(e.response!.data['message'] ?? 'Sunucu bir hata döndürdü.');
      } else {
        throw Exception('Sunucuya bağlanılamadı. IP adresini (10.10.0.74) ve backendin açık olduğunu kontrol et.');
      }
    }
  }
}
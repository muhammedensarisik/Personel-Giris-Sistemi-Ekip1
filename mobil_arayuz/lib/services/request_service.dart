import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobil_arayuz/model/request_model.dart';
import 'package:mobil_arayuz/services/api_service.dart';

class RequestService {
  final Dio _dio = ApiService().dio;

  Future<bool> submitRequest(RequestModel request) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId');

      if (userId == null) return false;

      // Backend'in beklediği DTO formatıyla birebir aynı yapı
      final data = {
        "userId": userId,
        "leaveType": request.type.label, // Örn: "İzin Talebi" veya "Rapor"
        "startDate": request.startDate.toIso8601String(),
        "endDate": request.endDate.toIso8601String(),
      };

      // Senin controller'ın rotası api/leaverequest
      final response = await _dio.post('/leaverequest', data: data);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      return false;
    } catch (e) {
      print("İzin gönderme hatası: $e");
      return false;
    }
  }

  // Kullanıcının kendi taleplerini çeker
  Future<List<dynamic>> getMyRequests() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('userId');

      if (userId == null) return [];

      final response = await _dio.get('/leaverequest/user/$userId');

      if (response.statusCode == 200) {
        return response.data; // Listeyi döndür
      }
      return [];
    } catch (e) {
      print("Geçmiş talepler çekilemedi: $e");
      return [];
    }
  }
}
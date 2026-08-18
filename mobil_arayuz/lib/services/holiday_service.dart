// Senin projendeki api_service.dart dosyasının yolunu buraya doğru girdiğinden emin ol
import 'package:mobil_arayuz/services/api_service.dart'; 

class HolidayService {
  Future<Map<String, dynamic>?> fetchUpcomingHoliday() async {
    try {
      // DİKKAT: Senin yazdığın o krallar gibi ApiService'in içindeki Dio'yu kullanıyoruz!
      // BaseUrl zaten '/api' ile bittiği için buraya sadece '/Holidays/upcoming' yazmamız yetiyor.
      final response = await ApiService().dio.get('/Holiday/upcoming');

      if (response.statusCode == 200) {
        final responseData = response.data;
        
        // Backend'den 'hasUpcoming: true' geldiyse tatil objesini döndür
        if (responseData['hasUpcoming'] == true) {
          return responseData['data'];
        }
      }
      return null; 
    } catch (e) {
      print("Yaklaşan tatil çekilirken hata oluştu: $e");
      return null; 
    }
  }
}
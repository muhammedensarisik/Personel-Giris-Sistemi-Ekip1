import 'package:dio/dio.dart';

class ApiService {
  // Singleton yapısı (Proje boyunca tek bir ApiService nesnesi yaşar)
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late final Dio dio;

  // DİKKAT: IP adresini projenin tamamı için SADECE BURAYA yazıyoruz
  final String baseUrl = 'http://10.10.0.39:5050/api';

  ApiService._internal() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // İleride her isteğe otomatik Token veya Role eklemek istersek buraya Interceptor yazacağız
  }
}
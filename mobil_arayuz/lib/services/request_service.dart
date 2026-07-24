import 'package:mobil_arayuz/model/request_model.dart';

class RequestService {

  Future<bool> submitRequest(RequestModel request) async {
    // API gecikmesini simüle ediyoruz
    await Future.delayed(const Duration(seconds: 1));

    return true;
  }
}
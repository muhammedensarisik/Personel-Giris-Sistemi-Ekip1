import 'package:mobil_arayuz/model/notification_model.dart';

class NotificationService {
  Future<List<NotificationModel>> fetchHistory() async {
    await Future.delayed(const Duration(seconds: 1));

    return [
      NotificationModel(
        title: "Bildirim 1",
        message: "Bu bir bildirim mesajıdır.",
        timestamp: DateTime.now(),
      ),
      NotificationModel(
        title: "Bildirim 2",
        message: "Bu da başka bir bildirim mesajıdır.",
        timestamp: DateTime.now(),
      ),
    ];
  }
}
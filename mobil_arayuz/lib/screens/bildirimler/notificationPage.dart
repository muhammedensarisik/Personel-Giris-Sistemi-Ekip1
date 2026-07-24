import 'package:flutter/material.dart';
import 'package:mobil_arayuz/model/notification_model.dart';
import 'package:mobil_arayuz/services/notification_service.dart';

class NotificationPage extends StatelessWidget {
  NotificationPage({super.key});

  final NotificationService service = NotificationService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Bildirimler"),
      ),
      body: FutureBuilder<List<NotificationModel>>(
        future: service.fetchHistory(),
        builder: (context, snapshot) {

          // Yükleniyor
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          // Hata
          if (snapshot.hasError) {
            return const Center(
              child: Text("Bir hata oluştu."),
            );
          }

          // Veri yok
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text("Bildirim bulunamadı."),
            );
          }

          final notifications = snapshot.data!;

          // Liste
          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final item = notifications[index];

              return Card(
                margin: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                child: ListTile(
                  leading: const Icon(Icons.notifications),
                  title: Text(item.title),
                  subtitle: Text(item.message),
                  trailing: Text(
                    "${item.timestamp.hour}:${item.timestamp.minute.toString().padLeft(2, '0')}",
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
import 'package:flutter/material.dart';

class NotificationStates {
  
  // 1. Yükleniyor Durumu
  static Widget buildLoading() {
    return const Center(child: CircularProgressIndicator());
  }

  // 2. Hata Durumu
  static Widget buildError(String errorMessage, VoidCallback onRetry) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
            const SizedBox(height: 16),
            Text(
              errorMessage, 
              textAlign: TextAlign.center, 
              style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w500)
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text("Tekrar Dene"),
            )
          ],
        ),
      ),
    );
  }

  static Widget buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text("Henüz bir duyuru yok.", style: TextStyle(color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}
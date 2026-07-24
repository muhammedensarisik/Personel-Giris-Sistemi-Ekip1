// lib/screens/auth/widgets/login_logo.dart
import 'package:flutter/material.dart';

class LoginLogo extends StatelessWidget {
  const LoginLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 40),
        // Logo İkon Alanı
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1565C0).withAlpha(20),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.lock_person_outlined,
            size: 64,
            color: Color(0xFF1565C0),
          ),
        ),
        const SizedBox(height: 16),
        // Başlıklar
        const Text(
          "Personel Takip Sistemi",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          "Lütfen hesabınızla giriş yapın",
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 40),
      ],
    );
  }
}
import 'package:flutter/material.dart';

class LoginButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool isLoading;

  const LoginButton({super.key, required this.onPressed, required this.isLoading});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1565C0), // Bunu ileride AppTheme'e taşı
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onPressed: isLoading ? null : onPressed,
        child: isLoading 
            ? const CircularProgressIndicator(color: Colors.white)
            : const Text("Giriş Yap", style: TextStyle(fontSize: 16, color: Colors.white)),
      ),
    );
  }
}
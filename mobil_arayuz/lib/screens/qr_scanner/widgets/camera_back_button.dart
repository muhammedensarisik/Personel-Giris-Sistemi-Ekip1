import 'package:flutter/material.dart';

class CameraBackButton extends StatelessWidget {
  const CameraBackButton({super.key});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 16, // Çentiğin hemen altı
      left: 16,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.black.withAlpha(100),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context), // Sayfayı kapat, alt barlı ekrana dön
        ),
      ),
    );
  }
}
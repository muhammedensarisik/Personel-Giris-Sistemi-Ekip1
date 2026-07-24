import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'widgets/qr_overlay.dart';
import 'widgets/camera_back_button.dart';

class CameraPage extends StatefulWidget {
  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  final MobileScannerController _cameraController = MobileScannerController();
  bool _isScanned = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          MobileScanner(
            controller: _cameraController,
            onDetect: (capture) {
              if (_isScanned) return;
              
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  if (mounted) {
                    setState(() {
                      _isScanned = true; 
                    });
                  }
                  
                  final String code = barcode.rawValue!;
                  
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('QR Okundu: $code')),
                  );
                  
                  break; 
                }
              }
            },
          ),
          
          // 2. Orta katman: Hedef Kare ve Yazı
          const QrOverlay(),
          
          // 3. Üst katman: Geri Butonu
          const CameraBackButton(),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _cameraController.dispose();
    super.dispose();
  }
}
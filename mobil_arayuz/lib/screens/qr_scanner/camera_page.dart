import 'package:flutter/material.dart';
import 'package:mobil_arayuz/services/qr_service.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:permission_handler/permission_handler.dart';
import 'widgets/qr_overlay.dart';
import 'widgets/camera_back_button.dart';

class CameraPage extends StatefulWidget {
  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  final MobileScannerController _cameraController = MobileScannerController();
  bool _hasPermissions = false;
  bool _isProcessing = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _checkAndRequestPermissions();
  }

  Future<void> _checkAndRequestPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lütfen telefonun Konum (GPS) servisini açın!'),
          backgroundColor: Colors.orange,
          duration: Duration(seconds: 4),
        ),
      );
      return;
    }

    var locationStatus = await Permission.locationWhenInUse.status;
    var cameraStatus = await Permission.camera.status;

    if (!locationStatus.isGranted || !cameraStatus.isGranted) {
      locationStatus = await Permission.locationWhenInUse.request();
      cameraStatus = await Permission.camera.request();
    }

    if (locationStatus.isGranted && cameraStatus.isGranted) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('qr_permissions_granted', true);
      if (mounted) setState(() => _hasPermissions = true);
    } 
    else if (locationStatus.isPermanentlyDenied || cameraStatus.isPermanentlyDenied) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Konum veya kamera izni kalıcı olarak reddedildi. Lütfen ayarlardan verin.'),
          backgroundColor: Colors.red,
        ),
      );
      await openAppSettings();
    } 
    else {
      if (!mounted) return;
      setState(() => _hasPermissions = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('QR okutabilmek için kamera ve konum izni şarttır!'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _processScan(String qrData) async {
    if (!mounted || _isProcessing || _isLoading) return;
    
    setState(() {
      _isProcessing = true;
      _isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final String savedUserId = prefs.getString('userId') ?? ''; 

      if (savedUserId.isEmpty) {
        throw Exception("Oturum bilgisi bulunamadı. Lütfen uygulamaya tekrar giriş yapın.");
      }

      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 7),
        ),
      );

      final requestData = {
        "userId": savedUserId, 
        "qrData": qrData,
        "latitude": position.latitude,
        "longitude": position.longitude,
      };

      final response = await QrService().sendQrScanData(requestData);
      
      if (!mounted) return;
      setState(() => _isLoading = false);

      bool isStarting = response.data['isStarting'] ?? true;
      String actionText = isStarting ? "başlatılacak" : "bitirilecek";

      bool? confirm = await _showConfirmationDialog(actionText);
      
      if (confirm == true) {
        if (!mounted) return;

        setState(() => _isLoading = true);
        await Future.delayed(const Duration(milliseconds: 600));

        if (!mounted) return;

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Mesai başarıyla ${isStarting ? "başlatıldı" : "bitirildi"}!'), 
            backgroundColor: Colors.green
          ),
        );
        
        // GÜVENLİ ÇIKIŞ KONTROLÜ: Yığın boşsa uygulamayı patlatmaz, güvenle geri döner
        if (Navigator.canPop(context)) {
          Navigator.pop(context);
        }
      } else {
        if (!mounted) return;
        setState(() {
          _isLoading = false;
          _isProcessing = false;
        });
      }

    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      
      String errorMessage = e.toString();
      String displayText = "Bir hata oluştu.";

      if (errorMessage.contains("Süresi dolmuş") || errorMessage.contains("Geçersiz QR")) {
        displayText = "QR eşleşmesi yapılamadı";
      } else if (errorMessage.contains("Şube dışındasınız") || errorMessage.contains("Konum eşleşmesi yapılamadı")) {
        displayText = "Konum eşleşmesi yapılamadı";
      } else {
        displayText = errorMessage;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(displayText), backgroundColor: Colors.red),
      );

      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  Future<bool?> _showConfirmationDialog(String actionText) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("Mesai İşlemi"),
        content: Text("Mesai $actionText, emin misiniz?"),
        actions: [
          TextButton(
            onPressed: () {
              if (Navigator.canPop(context)) Navigator.pop(context, false);
            },
            child: const Text("İptal", style: TextStyle(color: Colors.red)),
          ),
          ElevatedButton(
            onPressed: () {
              if (Navigator.canPop(context)) Navigator.pop(context, true);
            },
            child: const Text("Evet, Onaylıyorum"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_hasPermissions) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("Kamera ve Konum izni gereklidir."),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _checkAndRequestPermissions,
                child: const Text("İzinleri Ver"),
              )
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          MobileScanner(
            controller: _cameraController,
            onDetect: (capture) {
              if (_isProcessing || _isLoading) return;
              
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  _processScan(barcode.rawValue!);
                  break; 
                }
              }
            },
          ),
          const QrOverlay(),
          const CameraBackButton(),
          
          if (_isLoading)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(color: Colors.green),
              ),
            ),
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
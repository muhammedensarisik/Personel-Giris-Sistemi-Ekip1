import 'package:flutter/material.dart';
import 'package:mobil_arayuz/services/support_service.dart';

class SupportFormPage extends StatefulWidget {
  const SupportFormPage({super.key});

  @override
  State<SupportFormPage> createState() => _SupportFormPageState();
}

class _SupportFormPageState extends State<SupportFormPage> {
  final SupportService _supportService = SupportService();
  final TextEditingController _subjectController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();
  
  List<Map<String, dynamic>> _managers = [];
  String? _selectedManagerId;
  bool _isLoadingManagers = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadManagers(); // Sayfa açılır açılmaz yöneticileri veritabanından çekiyoruz
  }

  Future<void> _loadManagers() async {
    print("DEBUG (UI) - Yöneticiler veritabanından çekiliyor...");
    final managers = await _supportService.fetchSupportTargets();
    
    if (!mounted) return;
    
    setState(() {
      _managers = managers;
      _isLoadingManagers = false;
    });
    
    print("DEBUG (UI) - Dropdown'a Yüklenen Yönetici Sayısı: ${_managers.length}");
    print("DEBUG (UI) - Yöneticiler Listesi: $_managers");
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitSupportTicket() async {
    if (_selectedManagerId == null || _subjectController.text.trim().isEmpty || _messageController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Lütfen yönetici seçip konu ve açıklama girin"), backgroundColor: Colors.redAccent),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    print("DEBUG (UI) - Bilet Gönderiliyor...");
    print("DEBUG (UI) - Hedef Yönetici ID: $_selectedManagerId");
    print("DEBUG (UI) - Konu: ${_subjectController.text.trim()}");

    final success = await _supportService.createSupportTicket(
      targetManagerId: _selectedManagerId!,
      subject: _subjectController.text.trim(),
      message: _messageController.text.trim(),
      imagePath: null,
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      print("DEBUG (UI) - Bilet başarıyla gönderildi, sayfa kapatılıyor.");
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Destek talebiniz yöneticiye iletildi!"), backgroundColor: Color(0xFF10B981)),
      );
    } else {
      print("DEBUG (UI) - Bilet gönderimi BAŞARISIZ oldu.");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Talep gönderilemedi, oturumunuzu kontrol edin."), backgroundColor: Colors.redAccent),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Destek Talebi Oluştur", style: TextStyle(fontWeight: FontWeight.w600)),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. DİNAMİK YÖNETİCİ / ADMİN SEÇİMİ
            const Text("İlgili Yönetici / Admin", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isDark ? Colors.grey.shade900 : Colors.grey.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300),
              ),
              child: _isLoadingManagers
                  ? const Padding(
                      padding: EdgeInsets.symmetric(vertical: 16),
                      child: Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))),
                    )
                  : DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        // Dropdown güvenlik kilidi: Seçili ID listede yoksa null yap (çökmeyi engeller)
                        value: _managers.any((m) => m['id'].toString() == _selectedManagerId) ? _selectedManagerId : null,
                        hint: Text("yönetici seçin...", style: TextStyle(color: isDark ? Colors.grey.shade600 : Colors.grey.shade400)),
                        isExpanded: true,
                        dropdownColor: isDark ? Colors.grey.shade900 : Colors.white,
                        items: _managers.map((manager) {
                          final name = manager['fullName'] ?? manager['name'] ?? 'Yetkili';
                          final role = manager['role'] ?? 'Yönetici';
                          final id = manager['id'].toString();

                          return DropdownMenuItem<String>(
                            value: id,
                            child: Text("$name ($role)", style: TextStyle(color: theme.colorScheme.onSurface)),
                          );
                        }).toList(),
                        onChanged: (val) {
                          print("DEBUG (UI) - Dropdown'dan seçilen ID: $val");
                          setState(() => _selectedManagerId = val);
                        },
                      ),
                    ),
            ),

            const SizedBox(height: 20),

            // 2. KONU / BAŞLIK
            const Text("Konu", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            TextField(
              controller: _subjectController,
              style: TextStyle(color: theme.colorScheme.onSurface),
              decoration: InputDecoration(
                hintText: "Örn: Bilgisayar donanım arızası / QR okutmuyor",
                hintStyle: TextStyle(color: isDark ? Colors.grey.shade600 : Colors.grey.shade400),
                filled: true,
                fillColor: isDark ? Colors.grey.shade900 : Colors.grey.shade50,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.all(16),
              ),
            ),

            const SizedBox(height: 20),

            // 3. AÇIKLAMA (MESAJ)
            const Text("Açıklama / Hata Detayı", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            TextField(
              controller: _messageController,
              maxLines: 5,
              style: TextStyle(color: theme.colorScheme.onSurface),
              decoration: InputDecoration(
                hintText: "Yaşadığınız sorunu detaylıca açıklayın...",
                hintStyle: TextStyle(color: isDark ? Colors.grey.shade600 : Colors.grey.shade400),
                filled: true,
                fillColor: isDark ? Colors.grey.shade900 : Colors.grey.shade50,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.all(16),
              ),
            ),

            const SizedBox(height: 20),

            // 4. EKRAN RESMİ YÜKLEME ALANI
            const Text("Ekran Görüntüsü (İsteğe Bağlı)", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            InkWell(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Resim seçme özelliği eklenecek")));
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 20),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey.shade900 : Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300),
                ),
                child: Column(
                  children: [
                    Icon(Icons.add_photo_alternate_outlined, size: 32, color: theme.colorScheme.primary),
                    const SizedBox(height: 8),
                    Text("Ekran Resmi Yüklemek için Tıklayın", style: TextStyle(fontSize: 13, color: isDark ? Colors.grey.shade400 : Colors.grey.shade600)),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),

            // GÖNDER BUTONU
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submitSupportTicket,
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: _isSubmitting
                    ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : const Text("Destek Talebini Gönder", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
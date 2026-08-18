import 'package:flutter/material.dart';
import 'package:mobil_arayuz/components/app_base_card.dart';
import 'package:mobil_arayuz/services/settings_service.dart';

class ProfileWidget extends StatefulWidget {
  const ProfileWidget({super.key});

  @override
  State<ProfileWidget> createState() => _ProfileWidgetState();
}

class _ProfileWidgetState extends State<ProfileWidget> {
  final SettingsService _service = SettingsService();

  bool _isLoading = true;
  String? _errorMessage;

  String _fullName = "";
  String _department = "";
  String _title = "";
  String _email = "";

  @override
  void initState() {
    super.initState();
    _loadProfileData(); 
  }

  Future<void> _loadProfileData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await _service.fetchProfile();
      
      if (mounted) {
        setState(() {
          _fullName = data['fullName'] ?? "İsimsiz Kullanıcı";
          _department = data['department'] ?? "Departman Belirtilmemiş";
          _title = data['title'] ?? "Personel";
          _email = data['email'] ?? "E-posta yok";
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll("Exception:", "").trim();
          _isLoading = false;
        });
      }
    }
  }

  void _showEditBottomSheet(BuildContext context, String title, String currentValue, Function(String) onSave) {
    final TextEditingController controller = TextEditingController(text: currentValue);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: isDark ? Colors.grey.shade900 : Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 20, 
            left: 24, right: 24, top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("$title Güncelle", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: theme.colorScheme.onSurface)),
              const SizedBox(height: 20),
              TextField(
                controller: controller,
                keyboardType: TextInputType.emailAddress,
                style: TextStyle(color: theme.colorScheme.onSurface),
                decoration: InputDecoration(
                  labelText: "Yeni $title",
                  labelStyle: TextStyle(color: isDark ? Colors.grey.shade400 : Colors.grey.shade600),
                  filled: true,
                  fillColor: isDark ? Colors.black26 : Colors.grey.shade50,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                  prefixIcon: Icon(Icons.email_outlined, color: theme.colorScheme.primary),
                ),
                autofocus: true,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary, 
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    if (controller.text.trim().isNotEmpty) {
                      onSave(controller.text.trim());
                      Navigator.pop(context);
                    }
                  },
                  child: const Text("Kaydet", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Padding(
        padding: const EdgeInsets.all(20.0),
        child: Center(
          child: Text(
            _errorMessage!, 
            style: const TextStyle(color: Colors.redAccent),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    // İkonların arkaplan ve renkleri için ana sayfadaki "Emerald/Soft" uyumlu palet
    final iconBgColor = isDark ? Colors.grey.shade800 : colorScheme.primary.withValues(alpha: 0.1);
    final iconFgColor = isDark ? Colors.white70 : colorScheme.primary;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          // 1. ÜST PROFİL KARTI
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey.shade900 : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: theme.dividerColor.withValues(alpha: isDark ? 0.2 : 0.4)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: iconBgColor,
                  child: Icon(Icons.person_rounded, size: 36, color: iconFgColor), 
                ),
                const SizedBox(height: 16),
                Text(
                  _fullName, 
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: colorScheme.onSurface),
                ),
                const SizedBox(height: 4),          
                Text(
                  _title, 
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: colorScheme.primary),
                )              
              ],
            ),
          ),
          
          const SizedBox(height: 20),

          // 2. DEPARTMAN KARTI
          AppBaseCard(
            isDark: isDark,
            badgeColor: Colors.transparent, // Boş rozet gereksiz yer kaplamasın
            leadingIcon: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.work_outline_rounded, color: iconFgColor),
            ),
            title: "Departman",
            subtitle: _department,
            onTap: () {}, 
          ),

          const SizedBox(height: 4),

          // 3. E-POSTA KARTI
          AppBaseCard(
            isDark: isDark,
            badgeColor: colorScheme.primary, // Sadece düzenle butonunda tema rengi aksan olarak kalır
            badgeText: "Düzenle", 
            leadingIcon: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: iconBgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.email_outlined, color: iconFgColor),
            ),
            title: "E-posta Adresi",
            subtitle: _email,
            onTap: () {
              _showEditBottomSheet(context, "E-posta", _email, (newValue) async {
                try {
                  final success = await _service.updateContactInfo(newValue, ''); 
                  if (success && mounted) {
                    setState(() => _email = newValue);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("E-posta güncellendi!"), backgroundColor: Color(0xFF10B981)),
                    );
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(e.toString()), backgroundColor: Colors.redAccent),
                    );
                  }
                }
              });
            },
          ),
        ],
      ),
    );
  }
}
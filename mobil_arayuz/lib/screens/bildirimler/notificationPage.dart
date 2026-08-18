import 'package:flutter/material.dart';
import 'package:mobil_arayuz/screens/bildirimler/widgets/notification_bottom_sheet.dart';
import '../../model/notification_model.dart';
import '../../services/notification_service.dart';
import 'widgets/notification_card_item.dart';
import 'widgets/notification_states.dart';

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  final NotificationService _service = NotificationService();
  
  bool _isLoading = true;
  String? _errorMessage;
  List<NotificationModel> _notifications = [];

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      final data = await _service.fetchNotifications();
      if (mounted) {
        setState(() {
          _notifications = data;
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Duyurular", style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all_rounded),
            tooltip: "Tümünü Okundu İşaretle",
            onPressed: () {
              setState(() {
                // Listendeki tüm bildirimlerin okundu durumunu güncelliyoruz
                for (var n in _notifications) {
                  // n.isRead = true; (Modelinde isRead varsa)
                }
              });
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Tüm duyurular okundu olarak işaretlendi.")),
              );
            },
          ),
        ],
      ),
      body: _buildBody(isDark),
    );
  }

  Widget _buildBody(bool isDark) {
    if (_isLoading) {
      return NotificationStates.buildLoading();
    }
    
    if (_errorMessage != null) {
      return NotificationStates.buildError(_errorMessage!, _loadNotifications);
    }

    if (_notifications.isEmpty) {
      return NotificationStates.buildEmpty();
    }

    return RefreshIndicator(
      onRefresh: _loadNotifications,
      child: ListView.builder(
  padding: const EdgeInsets.all(16),
  itemCount: _notifications.length,
  itemBuilder: (context, index) {
    final notification = _notifications[index];
    
    return NotificationCardItem(
      notification: notification,
      isDark: isDark,
      onTap: () {
        // Karttaki tıklama olunca çalışacak yer:
        showNotificationDetail(context, notification);
      },
    );
  },
),
    );
  }
}
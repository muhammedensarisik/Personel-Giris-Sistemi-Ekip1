import 'package:flutter/material.dart';
import 'package:mobil_arayuz/services/request_service.dart';
import 'package:mobil_arayuz/services/support_service.dart'; // Destek servisini ekledik

class MyRequestsPage extends StatefulWidget {
  const MyRequestsPage({super.key});

  @override
  State<MyRequestsPage> createState() => _MyRequestsPageState();
}

class _MyRequestsPageState extends State<MyRequestsPage> {
  int _selectedIndex = 0; 

  final RequestService _leaveService = RequestService();
  final SupportService _supportService = SupportService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text(
          "Geçmiş Taleplerim",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: _buildFilterButton(
                    title: "İzin Talepleri",
                    icon: Icons.beach_access_rounded,
                    index: 0,
                    activeColor: Colors.deepPurple,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildFilterButton(
                    title: "Destek Taleplerim",
                    icon: Icons.support_agent_rounded,
                    index: 1,
                    activeColor: Colors.teal,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),
            
            Expanded(
              child: _selectedIndex == 0 ? _buildLeaveRequestList() : _buildSupportTicketList(),
            ),
          ],
        ),
      ),
    );
  }

  // --- FİLTRE BUTONU ---
  Widget _buildFilterButton({
    required String title,
    required IconData icon,
    required int index,
    required Color activeColor,
  }) {
    final isActive = _selectedIndex == index;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return InkWell(
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isActive 
              ? activeColor.withValues(alpha: 0.15) 
              : (isDark ? Colors.grey.shade900 : Colors.white), 
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive 
                ? activeColor.withValues(alpha: 0.5) 
                : (isDark ? Colors.grey.shade800 : Colors.grey.shade300), 
            width: 1.5,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isActive ? activeColor : (isDark ? Colors.grey.shade500 : Colors.grey.shade400),
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                color: isActive 
                    ? (isDark ? Colors.white : activeColor) 
                    : (isDark ? Colors.grey.shade500 : Colors.grey.shade600),
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- 1. İZİN TALEPLERİ LİSTESİ ---
  Widget _buildLeaveRequestList() {
    return FutureBuilder<List<dynamic>>(
      future: _leaveService.getMyRequests(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(
            child: Text(
              "Henüz bir izin talebiniz bulunmuyor.",
              style: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? Colors.grey.shade400 : Colors.grey.shade600),
            ),
          );
        }

        final filteredList = snapshot.data!.where((item) {
          return item['leaveType'] == "İzin Talebi";
        }).toList();

        if (filteredList.isEmpty) {
          return Center(
            child: Text(
              "Bu kategoriye ait talep bulunmuyor.",
              style: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? Colors.grey.shade400 : Colors.grey.shade600),
            ),
          );
        }
        
        return ListView.separated(
          itemCount: filteredList.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final request = filteredList[index];
            DateTime start = DateTime.parse(request['startDate']);
            DateTime end = DateTime.parse(request['endDate']);
            String formattedDates = "${start.day.toString().padLeft(2, '0')}.${start.month.toString().padLeft(2, '0')}.${start.year} - ${end.day.toString().padLeft(2, '0')}.${end.month.toString().padLeft(2, '0')}.${end.year}";

            return _buildCard(
              title: request['leaveType'] ?? "İzin Talebi",
              subtitle: formattedDates,
              status: request['status'],
              icon: Icons.beach_access_rounded,
              iconColor: Colors.deepPurple,
            );
          },
        );
      },
    );
  }

  // --- 2. DESTEK TALEPLERİ LİSTESİ (ANLIK GÖRÜNTÜLEME) ---
  Widget _buildSupportTicketList() {
    return FutureBuilder<List<dynamic>>(
      future: _supportService.getMySupportTickets(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(
            child: Text(
              "Henüz bir destek talebiniz bulunmuyor.",
              style: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? Colors.grey.shade400 : Colors.grey.shade600),
            ),
          );
        }

        final tickets = snapshot.data!;

        return ListView.separated(
          itemCount: tickets.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final ticket = tickets[index];
            
            // Tarih formatlama
            DateTime createdAt = DateTime.parse(ticket['createdAt']);
            String formattedDate = "${createdAt.day.toString().padLeft(2, '0')}.${createdAt.month.toString().padLeft(2, '0')}.${createdAt.year} ${createdAt.hour.toString().padLeft(2, '0')}:${createdAt.minute.toString().padLeft(2, '0')}";

            return _buildCard(
              title: ticket['subject'], // Konu başlığı
              subtitle: "$formattedDate\n${ticket['message']}", // Tarih + Açıklama detayı
              status: ticket['status'], // Beklemede, İnceleniyor, Çözüldü vb.
              icon: Icons.support_agent_rounded,
              iconColor: Colors.teal,
            );
          },
        );
      },
    );
  }

  // --- ORTAK KART TASARIMI ---
  Widget _buildCard({
    required String title,
    required String subtitle,
    required String status,
    required IconData icon,
    required Color iconColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    Color badgeColor;
    String statusText;
    IconData statusIcon;

    // Durumlara göre rozet renkleri ve metinleri
    if (status == "Approved" || status == "Onaylandı") {
      badgeColor = Colors.green;
      statusText = "Onaylandı";
      statusIcon = Icons.check_circle;
    } else if (status == "Rejected" || status == "Reddedildi") {
      badgeColor = Colors.red;
      statusText = "Reddedildi";
      statusIcon = Icons.cancel;
    } else if (status == "İnceleniyor") {
      badgeColor = Colors.blue;
      statusText = "İnceleniyor";
      statusIcon = Icons.sync;
    } else {
      badgeColor = Colors.orange;
      statusText = "Beklemede";
      statusIcon = Icons.access_time_filled;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey.shade900 : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300), 
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 16),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold, 
                    fontSize: 15,
                    color: isDark ? Colors.white : Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12, 
                    fontWeight: FontWeight.w500,
                    color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          
          const SizedBox(width: 8),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: badgeColor.withValues(alpha: 0.5)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(statusIcon, color: badgeColor, size: 14),
                const SizedBox(width: 4),
                Text(
                  statusText,
                  style: TextStyle(color: badgeColor, fontWeight: FontWeight.w700, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
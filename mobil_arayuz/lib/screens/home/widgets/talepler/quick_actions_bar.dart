import 'package:flutter/material.dart';
import 'package:mobil_arayuz/model/request_model.dart';
import 'package:mobil_arayuz/screens/home/requests/request_form_page.dart';
import 'package:mobil_arayuz/screens/home/widgets/talepler/my_requests_page.dart';
import '../quick_action_button.dart';

class QuickActionsBar extends StatelessWidget {
  const QuickActionsBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 1. İzin Talebi Butonu
        QuickActionButton(
          label: "İzin Talebi",
          subtitle: "Yeni bir mazeret veya izin bildir", // İzin butonuna da açıklama ekledik ki boş kalmasın
          icon: Icons.beach_access_rounded,
          color: Colors.deepPurple,
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const RequestFormPage(type: RequestType.izin)),
          ),
        ),
        
        const SizedBox(height: 12), // İki buton arası boşluk
        
        // 2. Geçmiş Taleplerim Butonu
        QuickActionButton(
          label: "Geçmiş Taleplerim",
          subtitle: "İzin ve rapor durumlarını görüntüle",
          icon: Icons.history_edu_rounded,
          color: Colors.blueAccent,
          onTap: () => Navigator.push(
            context, 
            MaterialPageRoute(builder: (context) => const MyRequestsPage())
          ),
        ),
      ],
    );
  }
}
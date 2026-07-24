import 'package:flutter/material.dart';
import 'package:mobil_arayuz/model/request_model.dart';
import 'package:mobil_arayuz/screens/home/requests/request_form_page.dart';
import 'quick_action_button.dart';

class QuickActionsBar extends StatelessWidget {
  const QuickActionsBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: QuickActionButton(
            label: "İzin Talebi",
            icon: Icons.beach_access_rounded,
            color: Colors.deepPurple,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const RequestFormPage(type: RequestType.izin)),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: QuickActionButton(
            label: "Rapor Gönder",
            icon: Icons.medical_information_outlined,
            color: Colors.teal,
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (context) => const RequestFormPage(type: RequestType.rapor)),
            ),
          ),
        ),
      ],
    );
  }
}
import 'package:flutter/material.dart';
import 'package:mobil_arayuz/model/request_model.dart';
import 'package:mobil_arayuz/services/request_service.dart';

class RequestFormPage extends StatefulWidget {
  final RequestType type;

  const RequestFormPage({super.key, required this.type});

  @override
  State<RequestFormPage> createState() => _RequestFormPageState();
}

class _RequestFormPageState extends State<RequestFormPage> {
  final RequestService _service = RequestService();
  final TextEditingController _reasonController = TextEditingController();

  DateTime? _startDate;
  DateTime? _endDate;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool isStart}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked == null) return;
    setState(() {
      if (isStart) {
        _startDate = picked;
      } else {
        _endDate = picked;
      }
    });
  }

  Future<void> _submit() async {
    if (_startDate == null || _endDate == null || _reasonController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Lütfen tüm alanları doldurun")),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final request = RequestModel(
      type: widget.type,
      startDate: _startDate!,
      endDate: _endDate!,
      reason: _reasonController.text.trim(),
    );

    final success = await _service.submitRequest(request);
    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (success) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("${widget.type.label} gönderildi")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Gönderilemedi, tekrar deneyin")),
      );
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return "Seçilmedi";
    return "${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}.${date.year}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.type.label, style: const TextStyle(fontWeight: FontWeight.w600)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Başlangıç Tarihi", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            _buildDateTile(label: _formatDate(_startDate), onTap: () => _pickDate(isStart: true)),
            const SizedBox(height: 20),
            const Text("Bitiş Tarihi", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            _buildDateTile(label: _formatDate(_endDate), onTap: () => _pickDate(isStart: false)),
            const SizedBox(height: 20),
            const Text("Açıklama", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            TextField(
              controller: _reasonController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: "Kısaca açıklayın",
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade300),
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text("Gönder", style: TextStyle( fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateTile({required String label, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Row(
          children: [
            Icon(Icons.calendar_today_outlined, size: 18, color: Colors.grey.shade500),
            const SizedBox(width: 10),
            Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
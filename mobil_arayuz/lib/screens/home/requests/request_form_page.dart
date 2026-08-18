import 'package:flutter/cupertino.dart';
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? Colors.grey.shade900 : Colors.white;
    final dividerColor = isDark ? Colors.grey.shade800 : Colors.grey.shade300;

    DateTime now = DateTime.now();
    DateTime today = DateTime(now.year, now.month, now.day);

    DateTime minDate = isStart 
        ? DateTime(today.year - 1, today.month, today.day) 
        : (_startDate ?? today);
    minDate = DateTime(minDate.year, minDate.month, minDate.day);

    DateTime initialDate = (isStart ? _startDate : _endDate) ?? today;
    initialDate = DateTime(initialDate.year, initialDate.month, initialDate.day);
    
    if (initialDate.isBefore(minDate)) {
      initialDate = minDate;
    }

    DateTime tempPickedDate = initialDate;

    await showModalBottomSheet(
      context: context,
      backgroundColor: bgColor, // DARK MODA DUYARLI ARKA PLAN
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return SizedBox(
          height: 300,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(border: Border(bottom: BorderSide(color: dividerColor))),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text("İptal", style: TextStyle(color: Colors.red, fontSize: 16)),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, tempPickedDate),
                      child: const Text("Seç", style: TextStyle(color: Colors.blue, fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              Expanded(
                // Tema CupertinoDatePicker'a otomatik işler, arka plan düzgün olunca yazılar da okunur
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.date,
                  initialDateTime: initialDate,
                  minimumDate: minDate, 
                  maximumDate: DateTime(today.year + 3),
                  onDateTimeChanged: (DateTime newDate) {
                    tempPickedDate = newDate; 
                  },
                ),
              ),
            ],
          ),
        );
      },
    ).then((pickedDate) {
      if (pickedDate != null && pickedDate is DateTime) {
        setState(() {
          if (isStart) {
            _startDate = pickedDate;
            if (_endDate != null && _startDate!.isAfter(_endDate!)) {
              _endDate = null;
            }
          } else {
            _endDate = pickedDate;
          }
        });
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
            _buildDateTile(label: _formatDate(_startDate), onTap: () => _pickDate(isStart: true), isDark: isDark),
            const SizedBox(height: 20),
            const Text("Bitiş Tarihi", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            _buildDateTile(label: _formatDate(_endDate), onTap: () => _pickDate(isStart: false), isDark: isDark),
            const SizedBox(height: 20),
            const Text("Açıklama", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 8),
            TextField(
              controller: _reasonController,
              maxLines: 5,
              style: TextStyle(color: isDark ? Colors.white : Colors.black87),
              decoration: InputDecoration(
                hintText: "Kısaca açıklayın",
                hintStyle: TextStyle(color: isDark ? Colors.grey.shade500 : Colors.grey.shade400),
                filled: true,
                fillColor: isDark ? Colors.grey.shade900 : Colors.grey.shade50, // TextField arka planı
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: isDark ? Colors.grey.shade700 : Colors.grey.shade300),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: isDark ? Colors.grey.shade800 : Colors.grey.shade300),
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
                  backgroundColor: Colors.blue, // Buton rengini belirgin yapıyoruz
                  foregroundColor: Colors.white,
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text("Gönder", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Tarih seçme kutusunu (Tile) da dark moda uyarladık
  Widget _buildDateTile({required String label, required VoidCallback onTap, required bool isDark}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? Colors.grey.shade900 : Colors.transparent, // Kutu arka planı
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isDark ? Colors.grey.shade700 : Colors.grey.shade300),
        ),
        child: Row(
          children: [
            Icon(Icons.calendar_today_outlined, size: 18, color: isDark ? Colors.grey.shade400 : Colors.grey.shade500),
            const SizedBox(width: 10),
            Text(
              label, 
              style: TextStyle(
                fontSize: 14, 
                fontWeight: FontWeight.w500,
                color: isDark ? Colors.white : Colors.black87
              )
            ),
          ],
        ),
      ),
    );
  }
}
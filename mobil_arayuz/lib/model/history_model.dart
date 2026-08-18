import 'package:intl/intl.dart';

class HistoryModel {
  final int id;
  final String date;
  final String checkIn;
  final String checkOut;
  final String status;
  final int duration;

  HistoryModel({
    required this.id,
    required this.date,
    required this.checkIn,
    required this.checkOut,
    required this.status,
    required this.duration,
  });

  factory HistoryModel.fromJson(Map<String, dynamic> json) {
    final String rawCheckIn = json['checkInTime'] ?? json['check_in_time'] ?? '';
    final String? rawCheckOut = json['checkOutTime'] ?? json['check_out_time'];

    // Boş gelme ihtimaline karşı bug-fix
    DateTime checkInDt = DateTime.now();
    if (rawCheckIn.isNotEmpty) {
      checkInDt = DateTime.parse(rawCheckIn);
    }

    DateTime? checkOutDt;
    if (rawCheckOut != null && rawCheckOut.isNotEmpty) {
      checkOutDt = DateTime.parse(rawCheckOut);
    }

    return HistoryModel(
      id: json['id'] ?? 0,
      // İşte sihir burada: O karmaşık yazıyı DateFormat ile istediğimiz şekle sokuyoruz!
      date: DateFormat('dd.MM.yyyy').format(checkInDt),
      checkIn: DateFormat('HH:mm').format(checkInDt),
      checkOut: checkOutDt != null ? DateFormat('HH:mm').format(checkOutDt) : '--:--',
      status: json['status'] ?? 'Bilinmiyor',
      duration: json['duration'] ?? 0,
    );
  }
}
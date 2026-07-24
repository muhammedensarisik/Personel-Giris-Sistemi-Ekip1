import 'package:mobil_arayuz/model/history_model.dart';

class HistoryService {
  // Backend hazır olunca burayı 'http.get' ile değiştireceksin.
  Future<List<HistoryModel>> fetchHistory() async {
    // API gecikmesini simüle ediyoruz
    await Future.delayed(const Duration(seconds: 1)); 

    return [
      HistoryModel(date: "01.07.2026", checkIn: "08:30", checkOut: "17:30", status: "Tamamlandı"),
      HistoryModel(date: "30.06.2026", checkIn: "08:45", checkOut: "17:45", status: "Tamamlandı"),
      HistoryModel(date: "29.06.2026", checkIn: "09:00", checkOut: "17:00", status: "Eksik"),
      HistoryModel(date: "28.06.2026", checkIn: "08:15", checkOut: "17:15", status: "Tamamlandı"),
      HistoryModel(date: "27.06.2026", checkIn: "08:30", checkOut: "17:30", status: "Tamamlandı"),
      HistoryModel(date: "26.06.2026", checkIn: "08:45", checkOut: "17:45", status: "Tamamlandı"),
      HistoryModel(date: "25.06.2026", checkIn: "09:00", checkOut: "17:00", status: "Eksik"),
      HistoryModel(date: "24.06.2026    ", checkIn: "08:15", checkOut: "17:15", status: "Tamamlandı"),
    ];
  }
}
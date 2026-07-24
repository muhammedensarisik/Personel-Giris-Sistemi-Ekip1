class GiriscikisModel {
  final String status;
  final String time;
  final String date;

  GiriscikisModel({
    required this.status,
    required this.time,
    required this.date,
  });

  factory GiriscikisModel.fromJson(Map<String, dynamic> json) {
    return GiriscikisModel(
      status: json['status'],
      time: json['time'],
      date: json['date'],
    );
  }

}
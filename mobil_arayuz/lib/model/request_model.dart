enum RequestType { izin, rapor }

extension RequestTypeLabel on RequestType {
  String get label => this == RequestType.izin ? "İzin Talebi" : "Rapor Talebi";
}

class RequestModel {
  final RequestType type;
  final DateTime startDate;
  final DateTime endDate;
  final String reason;

  const RequestModel({
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.reason,
  });

  Map<String, dynamic> toJson() {
    return {
      "type": type.name,
      "startDate": startDate.toIso8601String(),
      "endDate": endDate.toIso8601String(),
      "reason": reason,
    };
  }
}
// lib/model/user_model.dart
class UserModel {
  final String id;
  final String name;
  final String department;
  final String? token;

  UserModel({
    required this.id,
    required this.name,
    required this.department,
    this.token,
  });

  // Backend'den (JSON) gelen veriyi modele çevirmek için (Dinamik altyapı)
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      department: json['department'] ?? '',
      token: json['token'],
    );
  }

  // Gerekirse çıkış yaparken veya hafızaya kaydederken JSON'a çevirmek için
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'department': department,
      'token': token,
    };
  }
}
class NotificationModel {
  final int id;
  final String title;
  final String content;       
  final String priority;      
  final String authorName;    
  final String authorRole;    
  final DateTime createdAt;   

  NotificationModel({
    required this.id,
    required this.title,
    required this.content,
    required this.priority,
    required this.authorName,
    required this.authorRole,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? 'Başlıksız',
      content: json['content'] ?? '',
      priority: json['priority'] ?? 'Düşük',
      authorName: json['authorName'] ?? 'Sistem',
      authorRole: json['authorRole'] ?? 'Sistem',
      // C#'tan gelen tarihi Dart'ın anlayacağı DateTime formatına çeviriyoruz
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
    );
  }
}
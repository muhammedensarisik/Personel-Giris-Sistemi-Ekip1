using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Notification {
    [Column("id")] public int Id { get; set; }
    [Column("title")] public string Title { get; set; }
    [Column("message")] public string Message { get; set; }
    
    // Gönderenin bilgileri
    [Column("sender_id")] public Guid SenderId { get; set; }
    [Column("sender_name")] public string SenderName { get; set; }
    [Column("sender_role")] public string SenderRole { get; set; } // "Admin", "Manager", "User" vs.
    
    // Eğer bildirimi tek bir kişiye atıyorsak (boşsa herkese açık duyuru sayılabilir)
    [Column("receiver_id")] public Guid? ReceiverId { get; set; } 
    
    [Column("created_at")] public DateTime CreatedAt { get; set; }
    [Column("is_read")] public bool IsRead { get; set; }
}
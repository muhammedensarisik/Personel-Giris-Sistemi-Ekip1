using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("announcements")]
    public class Announcement
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("priority")]
        public string Priority { get; set; } = "Düşük";

        [Column("author_id")]
        public Guid? AuthorId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
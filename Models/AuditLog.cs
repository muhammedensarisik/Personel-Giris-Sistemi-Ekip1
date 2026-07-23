using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("audit_logs")]
    public class AuditLog
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("table_name")]
        public string TableName { get; set; } = string.Empty;

        [Column("operation")]
        public string Operation { get; set; } = string.Empty;

        [Column("old_data")]
        public string? OldData { get; set; } 

        [Column("new_data")]
        public string? NewData { get; set; }

        [Column("changed_by")]
        public string ChangedBy { get; set; } = string.Empty;

        [Column("changed_at")]
        public DateTime ChangedAt { get; set; }
    }
}
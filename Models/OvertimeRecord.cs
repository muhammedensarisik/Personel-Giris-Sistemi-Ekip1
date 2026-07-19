using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("overtime_records")]
public class OvertimeRecord 
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("record_date")]
    public DateTime RecordDate { get; set; }

    [Column("hours_worked")]
    public decimal HoursWorked { get; set; }

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
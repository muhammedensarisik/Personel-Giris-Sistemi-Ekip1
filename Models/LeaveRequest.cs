using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("leave_requests")]
public class LeaveRequest
{
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("leave_type")]
    public string LeaveType { get; set; } = string.Empty;

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Pending";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
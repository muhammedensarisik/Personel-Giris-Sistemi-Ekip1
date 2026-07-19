using System.ComponentModel.DataAnnotations.Schema;

public class Attendance {
    [Column("id")] public int Id { get; set; }
    [Column("user_id")] public Guid UserId { get; set; }
    [Column("location_id")] public int LocationId { get; set; }
    [Column("check_in_time")] public DateTime CheckInTime { get; set; }
    [Column("check_out_time")] public DateTime? CheckOutTime { get; set; }
    [Column("status")] public string Status { get; set; }
    [Column("duration")] public int Duration { get; set; }
}
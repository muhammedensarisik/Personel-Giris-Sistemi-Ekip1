public class SupportTicket
{
    public Guid Id { get; set; }                    // Tablonun kendi otomatik artan serial ID'si (Guid kalabilir)
    public Guid PersonnelId { get; set; }          // UUID karşılığı C#'ta Guid'dir
    public Guid TargetManagerId { get; set; }      // UUID karşılığı C#'ta Guid'dir
    public string? Subject { get; set; }
    public string? Message { get; set; }
    public string? ImagePath { get; set; }
    public string Status { get; set; } = "Beklemede";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
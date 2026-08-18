namespace backend.DTOs
{
    public class SupportTicketCreateDto
    {
        public Guid PersonnelId { get; set; }
        public Guid TargetManagerId { get; set; }
        public string? Subject { get; set; }
        public string? Message { get; set; }
        public string? ImagePath { get; set; }
    }
}
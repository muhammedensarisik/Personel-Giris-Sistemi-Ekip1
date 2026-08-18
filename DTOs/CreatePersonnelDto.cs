 namespace backend.DTOs
{
    public class CreatePersonnelDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        
        // Bunlar Admin için geçerli olacak, Manager için C# arka planda ezecek
        public string? Role { get; set; } 
        public Guid? ManagerId { get; set; }
    }
}
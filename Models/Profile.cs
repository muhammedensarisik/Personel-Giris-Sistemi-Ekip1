using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Profile 
{
    [Column("id")] 
    public Guid Id { get; set; }

    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Column("role")]
    public string Role { get; set; } = "Personel";

    [Column("department")]
    public string Department { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("manager_id")]
    public Guid? ManagerId { get; set; }

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;
}
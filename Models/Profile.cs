using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("profiles")]
public class Profile
{
    [Column("id")]
    public Guid Id { get; set; }

    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Column("role")]
    public string Role { get; set; } = "User";

    [Column("department")]
    public string? Department { get; set; } // Soru işareti eklendi (null kalabilir)

    [Column("email")]
    public string? Email { get; set; } // Soru işareti eklendi (null kalabilir)

    [Column("password_hash")]
    public string? PasswordHash { get; set; } // Soru işareti eklendi (null kalabilir)

    [Column("manager_id")]
    public Guid? ManagerId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
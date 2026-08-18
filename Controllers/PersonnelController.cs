using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PersonnelController : ControllerBase 
{
    private readonly PersonnelRepository _repo;

    public PersonnelController(PersonnelRepository repo) 
    { 
        _repo = repo; 
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() 
    {
        var role = Request.Headers["X-User-Role"].FirstOrDefault()?.ToLower();
        var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        Guid.TryParse(userIdStr, out Guid userId);

        // 2. Repo'ya yetkiyi ver, o sana süzülmüş listeyi getirsin
        var data = await _repo.GetAllByRoleAsync(role, userId);
        
        return Ok(data);
    }

    [HttpGet("managers")]
    public async Task<IActionResult> GetManagers()
    {
        var managers = await _repo.GetManagersAsync();
        return Ok(managers);
    }

    [HttpGet("my-profile/{id}")]
    public async Task<IActionResult> GetMyProfile(Guid id)
    {
        var profile = await _repo.GetByIdAsync(id);
        
        if (profile == null) 
        {
            return NotFound(new { message = "Kullanıcı bulunamadı." });
        }

        return Ok(profile);
    }

    

    [HttpGet("support-targets/{userId}")]
public async Task<IActionResult> GetSupportTargets(Guid userId)
{
    var currentUser = await _repo.GetByIdAsync(userId);
    if (currentUser == null)
    {
        return NotFound(new { message = "Kullanıcı bulunamadı." });
    }

    var allProfiles = await _repo.GetAllByRoleAsync(null, Guid.Empty);

    // Modelindeki property adına göre (currentUser.managerId veya ManagerId) burayı kontrol et
    var targets = allProfiles.Where(p => 
        p.Role?.ToLower() == "admin" || 
        (currentUser.ManagerId != null && p.Id == currentUser.ManagerId)
    ).ToList();

    return Ok(targets);
}   

[HttpGet("personnel-stats")]
    public async Task<IActionResult> GetPersonnelStats()
    {
        var allProfiles = await _repo.GetAllByRoleAsync(null, Guid.Empty);

        var managerCount = allProfiles.Count(p => p.Role?.ToLower() == "manager");
        var userCount = allProfiles.Count(p => p.Role?.ToLower() == "user");
        var adminCount = allProfiles.Count(p => p.Role?.ToLower() == "admin");

        var totalPersonnel = managerCount + userCount;
        var totalUsers = totalPersonnel + adminCount;

        return Ok(new 
        {
            manager = managerCount,
            user = userCount,
            admin = adminCount,
            totalPersonnel = totalPersonnel,
            totalUsers = totalUsers
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreatePersonnel([FromBody] DTOs.CreatePersonnelDto dto)
    {
        // 1. İsteği kim atıyor? Header'lardan Yakala
        var requesterRole = Request.Headers["X-User-Role"].FirstOrDefault();
        var requesterIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
        Guid.TryParse(requesterIdStr, out Guid requesterId);

        // 2. Yeni Personel Nesnesini Hazırla
        var newProfile = new Profile
        {
            Id = Guid.NewGuid(),
            FullName = dto.FullName,
            Department = dto.Department,
            Email = dto.Email,
            PasswordHash = dto.PasswordHash,
            CreatedAt = DateTime.UtcNow
        };

        // 3. GÜVENLİK DUVARI (Senin İstediğin Kısım)
        if (requesterRole?.ToLower() == "manager")
        {
            // Manager ekliyorsa: ROLÜ KESİNLİKLE "USER" YAP VE KENDİ ALTINA BAĞLA!
            newProfile.Role = "User";
            newProfile.ManagerId = requesterId; 
        }
        else if (requesterRole?.ToLower() == "admin")
        {
            // Admin ekliyorsa: Formdan gelen Rol ve ManagerId'yi kabul et, boşsa User yap.
            newProfile.Role = string.IsNullOrWhiteSpace(dto.Role) ? "User" : dto.Role;
            newProfile.ManagerId = dto.ManagerId;
        }
        else
        {
            // Ne idüğü belirsiz biri eklemeye çalışıyorsa engelle
            return Unauthorized(new { message = "Personel ekleme yetkiniz bulunmamaktadır." });
        }

        // 4. Veritabanına Kaydet
        await _repo.AddAsync(newProfile);

        return Ok(new { message = "Personel başarıyla eklendi.", data = newProfile });
    }
}
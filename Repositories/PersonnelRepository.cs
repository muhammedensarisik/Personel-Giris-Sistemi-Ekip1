using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class PersonnelRepository 
{
    private readonly AppDbContext _context;

    public PersonnelRepository(AppDbContext context) 
    { 
        _context = context; 
    }

    public async Task<List<Profile>> GetAllByRoleAsync(string? role, Guid userId)
    {
        // 1. Sorguyu başlat (Henüz DB'ye gitmedi)
        var query = _context.profiles.AsQueryable();

        // 2. Rol bazlı güvenlik duvarı (Filtreleme)
        if (role == "manager")
        {
            // Manager sadece kendini ve altındaki User'ları çeker
            query = query.Where(p => p.ManagerId == userId || p.Id == userId);
        }
        else if (role == "user")
        {
            // User sadece kendini çeker
            query = query.Where(p => p.Id == userId);
        }
        // Admin ise hiçbir if'e girmez, tüm liste kalır.

        // 3. Filtrelenmiş datayı çek ve gönder
        return await query.ToListAsync();
    }

    public async Task<List<Profile>> GetManagersAsync()
    {
        return await _context.profiles
            .Where(p => p.Role == "Manager")
            .ToListAsync();
    }
    public async Task<Profile?> GetByIdAsync(Guid id)
    {
        return await _context.profiles.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Profile> AddAsync(Profile profile)
    {
        _context.profiles.Add(profile);
        await _context.SaveChangesAsync();
        return profile;
    }
}
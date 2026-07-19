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

    public async Task<List<Profile>> GetAllAsync() 
    {
        return await _context.profiles.ToListAsync();
    }

    public async Task<List<Profile>> GetManagersAsync()
    {
        return await _context.profiles
            .Where(p => p.Role == "Manager")
            .ToListAsync();
    }
}
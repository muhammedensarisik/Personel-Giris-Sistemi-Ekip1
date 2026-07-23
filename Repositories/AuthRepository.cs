using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace backend.Repositories;

public class AuthRepository
{
    private readonly AppDbContext _context;

    public AuthRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Profile?> AuthenticateUserAsync(string email, string passwordHash)
    {
        return await _context.profiles
            .FirstOrDefaultAsync(p => p.Email == email && p.PasswordHash == passwordHash);
    }
}
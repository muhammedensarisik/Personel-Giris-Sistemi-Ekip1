using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        Console.WriteLine($"Gelen Email: {request.Email}, Gelen Şifre: {request.PasswordHash}");

        var user = await _context.profiles
            .FirstOrDefaultAsync(p => p.Email == request.Email && p.PasswordHash == request.PasswordHash);

        if (user == null) 
            return Unauthorized(new { message = "E-posta veya şifre hatalı!" });

        return Ok(new { 
            id = user.Id, 
            fullName = user.FullName, 
            role = user.Role,
            managerId = user.ManagerId // Frontend'in filtreleme yapması için bunu da gönderiyoruz
        });

        
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}
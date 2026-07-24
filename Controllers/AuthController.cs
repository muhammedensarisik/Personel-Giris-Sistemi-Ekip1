using backend.Models;
using backend.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;

namespace backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthRepository _repo;

    public AuthController(AuthRepository repo)
    {
        _repo = repo;
    }

    // ==========================================
    // 1. WEB PANEL GİRİŞİ (Sadece Admin/Manager)
    // ==========================================
    [HttpPost("login-web")]
    public async Task<IActionResult> LoginWeb([FromBody] LoginRequest request)
    {
        var user = await _repo.AuthenticateUserAsync(request.Email, request.PasswordHash);

        if (user == null || (user.Role != "Admin" && user.Role != "Manager")) 
        {
            return Unauthorized(new { message = "Böyle bir kullanıcı bulunamadı veya yetkisiz erişim." });
        }

        return Ok(new { id = user.Id, fullName = user.FullName, role = user.Role, managerId = user.ManagerId });
    }

    // ==========================================
    // 2. MOBİL UYGULAMA GİRİŞİ (Sadece User)
    // ==========================================
    [HttpPost("login-mobile")]
    public async Task<IActionResult> LoginMobile([FromBody] LoginRequest request)
    {
        var user = await _repo.AuthenticateUserAsync(request.Email, request.PasswordHash);

        if (user == null || user.Role != "User") 
        {
            return Unauthorized(new { message = "Böyle bir kullanıcı bulunamadı veya hatalı şifre." });
        }

        return Ok(new { id = user.Id, fullName = user.FullName, role = user.Role, managerId = user.ManagerId });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}
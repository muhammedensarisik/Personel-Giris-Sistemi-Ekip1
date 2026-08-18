using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AttendanceController : ControllerBase 
{
    private readonly AttendanceRepository _repo;

    public AttendanceController(AttendanceRepository repo) 
    { 
        _repo = repo; 
    }

    // PANEL İÇİN ENDPOINT (Admin ve Manager buraya istek atacak)
        [HttpGet("panel")]
        public async Task<IActionResult> GetPanelData() 
        {
            // Kimlik bilgilerini Header'dan okuyoruz
            var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id) ? id : Guid.Empty;
            var role = Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";

            if (role == "Admin")
            {
                var data = await _repo.GetAllAsync();
                return Ok(data);
            }
            else if (role == "Manager")
            {
                if (requesterId == Guid.Empty) return Unauthorized();
                
                var data = await _repo.GetTeamHistoryAsync(requesterId);
                return Ok(data);
            }
            
            // Eğer normal bir User panel endpointine girmeye çalışırsa engelliyoruz
            return Forbid();
        }

        [HttpGet("my-history/{userId}")]
public async Task<IActionResult> GetMyHistory(Guid userId)
{
    var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id) ? id : Guid.Empty;
    var role = Request.Headers["X-User-Role"].FirstOrDefault()?.ToLower() ?? "user"; // .ToLower() ekledik!

    // admin veya manager değilse ve başkasının profiline bakıyorsa engelle
    if (role != "admin" && role != "manager" && requesterId != userId)
    {
        return StatusCode(403, new { message = "Bu geçmişi görüntüleme yetkiniz yok." });
    }

    var history = await _repo.GetByUserIdAsync(userId);
    
    if (history == null || !history.Any())
    {
        return Ok(new List<Attendance>()); 
    }

    return Ok(history);
}


}
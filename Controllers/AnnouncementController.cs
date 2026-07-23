using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.Collections.Generic;
using backend.Repositories;

namespace backend.Controllers
{
    [ApiController]
[Route("api/[controller]")]
public class AnnouncementController : ControllerBase
{
    private readonly AnnouncementRepository _repo;

    public AnnouncementController(AnnouncementRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id) ? id : Guid.Empty;
        var role = Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";
        var managerId = Guid.TryParse(Request.Headers["X-User-Manager-Id"], out var mid) ? mid : (Guid?)null;
Console.WriteLine($"Gelen ID: {requesterId}, Gelen Rol: {role}");
        var data = await _repo.GetVisibleAnnouncementsAsync(requesterId, role, managerId);
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Announcement announcement)
    {
        await _repo.AddAsync(announcement);
        return Ok(announcement);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return Ok(new { message = "Duyuru silindi" });
    }
}
}
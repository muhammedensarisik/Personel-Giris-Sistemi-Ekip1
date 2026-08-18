using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Repositories;
using System.Threading.Tasks;
using System.Linq;
using System;

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

        // Admin + Manager + User duyuruları görebilir
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id)
                ? id : Guid.Empty;

            var role = Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";

            var managerId = Guid.TryParse(Request.Headers["X-User-Manager-Id"], out var mid)
                ? mid : (Guid?)null;

            var data = await _repo.GetVisibleAnnouncementsAsync(requesterId, role, managerId);
            return Ok(data);
        }

        // Sadece Admin ve Manager duyuru oluşturabilir
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Announcement announcement)
        {
            var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id)
                ? id : (Guid?)null;

            var role = Request.Headers["X-User-Role"].FirstOrDefault();

            if (role != "Admin" && role != "Manager")
            {
                return Forbid();
            }

            if (requesterId == null)
            {
                return Unauthorized();
            }

            // AuthorId her zaman giriş yapan kullanıcı olur
            announcement.AuthorId = requesterId;
            announcement.CreatedAt = DateTime.UtcNow;

            await _repo.AddAsync(announcement);
            return Ok(announcement);
        }

        // Admin her şeyi silebilir, Manager sadece kendi duyurusunu silebilir
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var rid)
                ? rid : Guid.Empty;

            var role = Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";

            var success = await _repo.DeleteAsync(id, requesterId, role);

            if (!success)
            {
                return NotFound(new { message = "Silinecek duyuru bulunamadı veya yetkiniz yok." });
            }

            return Ok(new { message = "Duyuru silindi" });
        }
    }
}
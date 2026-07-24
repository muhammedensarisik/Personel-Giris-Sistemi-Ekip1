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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id) ? id : Guid.Empty;
            var role = Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";
            var managerId = Guid.TryParse(Request.Headers["X-User-Manager-Id"], out var mid) ? mid : (Guid?)null;

            var data = await _repo.GetVisibleAnnouncementsAsync(requesterId, role, managerId);
            return Ok(data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Announcement announcement)
        {
            var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id) ? id : (Guid?)null;
            
            if (announcement.AuthorId == null || announcement.AuthorId == Guid.Empty)
            {
                announcement.AuthorId = requesterId;
            }

            announcement.CreatedAt = DateTime.UtcNow;

            await _repo.AddAsync(announcement);
            return Ok(announcement);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _repo.DeleteAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Silinecek duyuru bulunamadı." });
            }

            return Ok(new { message = "Duyuru silindi" });
        }
    }
}
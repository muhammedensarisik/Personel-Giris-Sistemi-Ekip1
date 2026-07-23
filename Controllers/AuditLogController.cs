using backend.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [Route("api/auditlogs")]
    [ApiController]
    public class AuditLogController : ControllerBase
    {
        private readonly AuditLogRepository _repo;

        public AuditLogController(AuditLogRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetLogs()
        {
            var role = Request.Headers["X-User-Role"].FirstOrDefault();

            // Sadece Adminler bu veriyi görebilir!
            if (string.IsNullOrEmpty(role) || role!= "Admin")
            {
                return Unauthorized(new { message = "Bu veriyi görüntülemek için sistem yöneticisi (Admin) yetkisine sahip olmalısınız." });
            }

            var logs = await _repo.GetRecentLogsAsync();
            return Ok(logs);
        }
    }
}
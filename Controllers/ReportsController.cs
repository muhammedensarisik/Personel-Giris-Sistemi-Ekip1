using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("bulk")]
        public async Task<IActionResult> GetBulkReport()
        {
            // 1. İstek atan kişinin yetkisini Header'dan yakala
            var role = Request.Headers["X-User-Role"].FirstOrDefault()?.ToLower() ?? "user";
            var userIdStr = Request.Headers["X-User-Id"].FirstOrDefault();
            Guid.TryParse(userIdStr, out Guid userId);

            // Standart User toplu rapor ekranını göremez!
            if (role == "user")
            {
                return StatusCode(403, new { message = "Toplu rapor görüntüleme yetkiniz yok." });
            }

            // 2. Yetkiye Göre Personelleri Çek (Güvenlik Duvarı)
            var profilesQuery = _context.profiles.AsQueryable();
            
            if (role == "manager")
            {
                // Yalnızca kendi altındaki personeller ve kendisi
                profilesQuery = profilesQuery.Where(p => p.ManagerId == userId || p.Id == userId);
            }
            
            var personnelList = await profilesQuery.ToListAsync();
            var personnelIds = personnelList.Select(p => p.Id).ToList();

            // 3. Bu personellerin Canlı Giriş/Çıkış Loglarını Çek
            var attendances = await _context.Attendances
                .Where(a => personnelIds.Contains(a.UserId))
                .ToListAsync();

            // 4. Raporu Haritala ve Hesapla
            var report = personnelList.Select(p => {
                var pLogs = attendances.Where(a => a.UserId == p.Id).ToList();

                return new 
                {
                    FullName = p.FullName,
                    Department = p.Department ?? "Genel",
                    Email = p.Email ?? $"{p.FullName.ToLower().Replace(" ", ".")}@sirket.com",
                    TotalWorkHours = pLogs.Sum(a => a.Duration ?? 0), // Gerçek çalışma sürelerinin toplamı
                    TotalLateDays = pLogs.Count(a => a.Status == "Gecikmeli"), // Geç kalınan gün sayısı
                    UsedLeaveDays = 0 // İzin modülün varsa buraya bağlayabilirsin
                };
            }).ToList();

            return Ok(report);
        }
    }
}
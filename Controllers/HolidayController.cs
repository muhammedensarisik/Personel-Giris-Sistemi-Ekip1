using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HolidayController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HolidayController(AppDbContext context)
        {
            _context = context;
        }

        // Panelde Takvim/Liste için tüm tatilleri çeker (Herkes okuyabilir)
        [HttpGet]
        public async Task<IActionResult> GetAllHolidays()
        {
            var holidays = await _context.Holidays.OrderBy(h => h.Date).ToListAsync();
            return Ok(holidays);
        }

        // Panelden yeni tatil ekleme (Sadece Admin yetkisi olanlar)
        [HttpPost]
        public async Task<IActionResult> AddHoliday([FromBody] Holiday newHoliday)
        {
            // GÜVENLİK DUVARI: Header'dan rolü yakala, Admin değilse kapı dışarı et!
            var requesterRole = Request.Headers["X-User-Role"].FirstOrDefault();
            if (string.IsNullOrEmpty(requesterRole) || requesterRole.ToLower() != "admin")
            {
                return Unauthorized(new { message = "Tatil ekleme yetkiniz bulunmamaktadır." });
            }

            newHoliday.Id = Guid.NewGuid();
            newHoliday.IsFixed = false; // Dışarıdan eklenenler asla sabit olamaz!
            
            _context.Holidays.Add(newHoliday);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Tatil başarıyla eklendi.", data = newHoliday });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHoliday(Guid id, [FromBody] Holiday updatedHoliday)
        {
            // GÜVENLİK DUVARI: Header'dan rolü yakala
            var requesterRole = Request.Headers["X-User-Role"].FirstOrDefault();
            if (string.IsNullOrEmpty(requesterRole) || requesterRole.ToLower() != "admin")
            {
                return Unauthorized(new { message = "Tatil güncelleme yetkiniz bulunmamaktadır." });
            }

            var holiday = await _context.Holidays.FindAsync(id);
            if (holiday == null) return NotFound(new { message = "Tatil bulunamadı." });

            if (holiday.IsFixed)
            {
                return BadRequest(new { message = "Bu sabit bir resmi/milli tatildir! Değiştirilemez." });
            }

            holiday.Name = updatedHoliday.Name;
            holiday.Date = updatedHoliday.Date;
            holiday.HolidayType = updatedHoliday.HolidayType;
            holiday.IsHalfDay = updatedHoliday.IsHalfDay;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Tatil başarıyla güncellendi.", data = holiday });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHoliday(Guid id)
        {
            // GÜVENLİK DUVARI: Header'dan rolü yakala
            var requesterRole = Request.Headers["X-User-Role"].FirstOrDefault();
            if (string.IsNullOrEmpty(requesterRole) || requesterRole.ToLower() != "admin")
            {
                return Unauthorized(new { message = "Tatil silme yetkiniz bulunmamaktadır." });
            }

            var holiday = await _context.Holidays.FindAsync(id);
            if (holiday == null) return NotFound(new { message = "Tatil bulunamadı." });

            // GÜVENLİK DUVARI: Sabit milli bayramlar silinemez!
            if (holiday.IsFixed)
            {
                return BadRequest(new { message = "Bu sabit bir resmi/milli tatildir! Silinemez veya değiştirilemez." });
            }

            _context.Holidays.Remove(holiday);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Tatil başarıyla silindi." });
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingHoliday()
        {
            var today = DateTime.UtcNow.Date;

            var upcomingHoliday = await _context.Holidays
                .Where(h => h.Date.Date >= today)
                .OrderBy(h => h.Date)
                .FirstOrDefaultAsync();

            if (upcomingHoliday == null)
            {
                return Ok(new { hasUpcoming = false, message = "Yakın zamanda planlanmış bir tatil yok." });
            }

            return Ok(new 
            { 
                hasUpcoming = true,
                data = upcomingHoliday 
            });
        }
    }
}
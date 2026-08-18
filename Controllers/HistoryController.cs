using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HistoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserHistory(Guid userId)
        {
            // 1. GÜVENLİK: İstek atan kişinin kimliğini Header'dan yakala
            var requesterId = Guid.TryParse(Request.Headers["X-User-Id"], out var id) ? id : Guid.Empty;
            var role = Request.Headers["X-User-Role"].FirstOrDefault() ?? "User";

            // 2. KONTROL: Admin veya Manager değilse, sadece kendi geçmişini görebilir
            if (role != "Admin" && role != "Manager" && requesterId != userId)
            {
                return StatusCode(403, new { message = "Bu kullanıcının geçmişine erişim yetkiniz yok." });
            }

            // 3. Kullanıcının mesai kayıtlarını CheckInTime'a göre tersten çekiyoruz
            var records = await _context.Attendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CheckInTime)
                .ToListAsync();

            // 4. Veritabanındaki tüm tatilleri RAM'e al
            var publicHolidays = await _context.Holidays.ToListAsync();

            var resultList = new List<HistoryResponseDto>();

            // 5. Her bir geçmiş kayıt için Tatil ve Tarih kontrolü yapıyoruz
            foreach (var record in records)
            {
                bool isHoliday = false;
                string holidayName = "";

                DateTime recordDate = record.CheckInTime.Date;

                if (recordDate.DayOfWeek == DayOfWeek.Saturday || recordDate.DayOfWeek == DayOfWeek.Sunday)
                {
                    isHoliday = true;
                    holidayName = "Hafta Sonu";
                }
                else
                {
                    var officialHoliday = publicHolidays.FirstOrDefault(h => h.Date.Date == recordDate);
                    if (officialHoliday != null)
                    {
                        isHoliday = true;
                        holidayName = officialHoliday.Name;
                    }
                }

                resultList.Add(new HistoryResponseDto
                {
                    Date = recordDate.ToString("dd.MM.yyyy"),
                    CheckIn = record.CheckInTime.ToString("HH:mm"),
                    CheckOut = record.CheckOutTime?.ToString("HH:mm") ?? "--:--",
                    Status = record.Status ?? "bilinmiyor", 
                    Duration = record.Duration ?? 0, 
                    IsHoliday = isHoliday,
                    HolidayName = holidayName
                });
            }

            return Ok(resultList);
        }
    }
}
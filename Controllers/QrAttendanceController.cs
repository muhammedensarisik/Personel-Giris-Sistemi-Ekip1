using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using backend.Repositories;
using backend.Models;
using System;
using System.Threading.Tasks;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QrAttendanceController : ControllerBase
{
    private readonly IMemoryCache _cache;
    private readonly LocationRepository _locationRepo;
    private readonly AttendanceRepository _attendanceRepo; 
    
    public QrAttendanceController(IMemoryCache cache, LocationRepository locationRepo, AttendanceRepository attendanceRepo)
    {
        _cache = cache;
        _locationRepo = locationRepo;
        _attendanceRepo = attendanceRepo;
    }

    [HttpGet("generate/{locationId}")]
    [HttpPost("generate/{locationId}")]
    public async Task<IActionResult> GetOrCreateDailyQrToken(int locationId)
    {
        var location = await _locationRepo.GetActiveLocationByIdAsync(locationId);
        if (location == null) return NotFound(new { message = "Aktif lokasyon bulunamadı." });

        if (!_cache.TryGetValue($"QrToken_{locationId}", out string token))
        {
            token = Guid.NewGuid().ToString("N");
            var endOfDay = DateTime.Today.AddDays(1).AddTicks(-1);
            _cache.Set($"QrToken_{locationId}", token, new DateTimeOffset(endOfDay));
        }
        
        var qrData = $"{locationId}:{token}";
        return Ok(new { qrData, locationName = location.LocationName });
    }

    // 2. PANEL: YENİ QR ÜRETİp VERİTABANINA YAZMA
    [HttpPost("regenerate/{locationId}")]
    public async Task<IActionResult> RegenerateQrToken(int locationId)
    {
        var location = await _locationRepo.GetActiveLocationByIdAsync(locationId);
        if (location == null) return NotFound(new { message = "Aktif lokasyon bulunamadı." });

        var newToken = Guid.NewGuid().ToString("N");
        
        await _locationRepo.UpdateLocationQrSecretAsync(locationId, newToken);
        
        var qrData = $"{locationId}:{newToken}";
        return Ok(new { qrData, locationName = location.LocationName, message = "QR kod veritabanına kaydedildi!" });
    }

    // 3. MOBİL UYGULAMA: KAMERADAN OKUNAN QR'I VE KONUMU DOĞRULAMA + MESAİ BAŞLAT/BİTİR
    [HttpPost("scan")]
    public async Task<IActionResult> ScanQr([FromBody] QrScanDto request)
    {
        var parts = request.QrData.Split(':');
        if (parts.Length != 2 || !int.TryParse(parts[0], out int locationId))
        {
            return BadRequest(new { message = "Geçersiz QR formatı." });
        }
        var token = parts[1];

        var location = await _locationRepo.GetActiveLocationByIdAsync(locationId);
        if (location == null)
        {
            return BadRequest(new { message = "Şube pasif veya bulunamadı." });
        }

        if (location.QrCodeSecret != token)
        {
            return BadRequest(new { message = "Süresi dolmuş veya geçersiz QR kod (QR eşleşmesi yapılamadı)." });
        }

        double distance = CalculateDistance(location.Latitude, location.Longitude, request.Latitude, request.Longitude);
        if (distance > location.RadiusMeters)
        {
            return BadRequest(new { message = "Konum eşleşmesi yapılamadı (Şube dışındasınız)." });
        }

        // Kullanıcı ID'sini Guid formatına güvenli dönüştürme
        if (!Guid.TryParse(request.UserId, out Guid userGuid))
        {
            return BadRequest(new { message = "Geçersiz kullanıcı kimliği." });
        }

        // MESAİ KONTROLÜ: Bugün için açık mesaisi var mı?
        var today = DateTime.UtcNow.Date;
        var activeAttendance = await _attendanceRepo.GetActiveAttendanceAsync(userGuid, today);
        
        bool isStarting = (activeAttendance == null);

        if (isStarting)
        {
            // Açık mesai yok -> GİRİŞ YAP (INSERT) ve veritabanına yaz
            await _attendanceRepo.CheckInAsync(userGuid, locationId);
        }
        else
        {
            // Açık mesai var -> ÇIKIŞ YAP (UPDATE) ve çıkış saatini bas
            await _attendanceRepo.CheckOutAsync(activeAttendance);
        }

        return Ok(new { 
            message = isStarting ? "Mesai başarıyla başlatıldı." : "Mesai başarıyla sonlandırıldı.", 
            isStarting = isStarting 
        });
    }

    // --- YARDIMCI FONKSİYONLAR VE SINIFLAR ---

    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var d1 = lat1 * (Math.PI / 180.0);
        var num1 = lon1 * (Math.PI / 180.0);
        var d2 = lat2 * (Math.PI / 180.0);
        var num2 = lon2 * (Math.PI / 180.0) - num1;
        var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) +
                 Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);
        return 6371000.0 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3)));
    }
}

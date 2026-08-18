using Microsoft.AspNetCore.Mvc;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LocationController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public LocationController(AppDbContext context) 
    { 
        _context = context; 
    }

    // 1. MEVCUT METOD: Aktif Giriş Noktalarını Listeleme (Dropdown için)
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveLocations()
    {
        var locations = await _context.Locations
            .Where(l => l.IsActive)
            .Select(l => new { id = l.Id, locationName = l.LocationName }) 
            .ToListAsync();
        return Ok(locations);
    }

   [HttpPut("update-coordinates/{locationId}")]
    public async Task<IActionResult> UpdateCoordinates(int locationId, [FromBody] UpdateCoordinatesDto request)
    {
        try
        {
            var location = await _context.Locations.FindAsync(locationId);
            
            if (location == null) 
            {
                return NotFound(new { message = "Giriş noktası bulunamadı." });
            }

            location.Latitude = request.Latitude;
            location.Longitude = request.Longitude;
            
            // POSTGRESQL UTC KURALI: DateTime.UtcNow zorunludur!
            location.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = $"{location.LocationName} için konum başarıyla güncellendi!" });
        }
        catch (Exception ex)
        {
            var realError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            return StatusCode(500, new { message = "Veritabanı Hatası: " + realError });
        }
    }
}


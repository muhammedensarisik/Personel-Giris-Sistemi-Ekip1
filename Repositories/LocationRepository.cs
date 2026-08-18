using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Repositories;

public class LocationRepository
{
    private readonly AppDbContext _context;

    public LocationRepository(AppDbContext context)
    {
        _context = context;
    }

    // Aktif olan lokasyonu ID'ye göre getirir
    public async Task<Location?> GetActiveLocationByIdAsync(int id)
    {
        return await _context.Locations
            .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
    }

    // İleride dropdown için tüm aktif şubeleri listelemek istersen:
    public async Task<List<Location>> GetAllActiveLocationsAsync()
    {
        return await _context.Locations
            .Where(l => l.IsActive)
            .ToListAsync();
    }

    public async Task UpdateLocationQrSecretAsync(int locationId, string newSecret)
    {
        var location = await _context.Locations.FindAsync(locationId);
        if (location != null)
        {
            location.QrCodeSecret = newSecret;
            location.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}

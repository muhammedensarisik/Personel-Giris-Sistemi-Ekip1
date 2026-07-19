using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class OvertimeRepository {
    private readonly AppDbContext _context;
    public OvertimeRepository(AppDbContext context) { _context = context; }

    public async Task<List<OvertimeRecord>> GetAllAsync() {
        return await _context.OvertimeRecords.ToListAsync();
    }
}
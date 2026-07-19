using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class AttendanceRepository 
{
    private readonly AppDbContext _context;

    public AttendanceRepository(AppDbContext context) 
    { 
        _context = context; 
    }

    public async Task<List<Attendance>> GetAllAsync() 
    {
        return await _context.Attendances.ToListAsync();
    }
}
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repositories;

public class AuditLogRepository
{
    private readonly AppDbContext _context;

    public AuditLogRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLog>> GetRecentLogsAsync()
    {
        return await _context.AuditLogs
            .OrderByDescending(a => a.ChangedAt)
            .Take(20) // En son 20 işlemi getir
            .ToListAsync();
    }
}
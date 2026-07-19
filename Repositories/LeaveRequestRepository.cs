using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class LeaveRequestRepository 
{
    private readonly AppDbContext _context;

    public LeaveRequestRepository(AppDbContext context) 
    { 
        _context = context; 
    }

    public async Task<List<LeaveRequest>> GetAllAsync() 
    {
        return await _context.LeaveRequests.ToListAsync();
    }



    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        var request = await _context.LeaveRequests.FindAsync(id);
        if (request == null) return false;

        request.Status = status;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var request = await _context.LeaveRequests.FindAsync(id);
        if (request == null) return false;

        _context.LeaveRequests.Remove(request);
        await _context.SaveChangesAsync();
        return true;
    }

   public async Task<List<LeaveRequest>> GetByManagerIdAsync(Guid managerId)
    {
        // Artık .ToString() yapmamıza gerek yok, ikisi de Guid tipinde!
        return await _context.LeaveRequests
            .Where(lr => _context.profiles
                .Any(p => p.Id == lr.UserId && p.ManagerId == managerId))
            .ToListAsync();
    }
}
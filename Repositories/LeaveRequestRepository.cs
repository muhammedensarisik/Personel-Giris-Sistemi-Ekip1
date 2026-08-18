using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repositories;

public class LeaveRequestRepository 
{
    private readonly AppDbContext _context;

    public LeaveRequestRepository(AppDbContext context) 
    { 
        _context = context; 
    }

    // GÜNCELLENDİ: Antigravity'nin beklediği tam format (İsimler, Notlar ve Onaylayan dahil)
    public async Task<object> GetAllAsync() 
    {
        var query = from lr in _context.LeaveRequests
                    join p in _context.profiles on lr.UserId equals p.Id
                    // Onaylayan kişiyi bulmak için Left Join (Bekleyenlerde onaylayan yoktur çünkü)
                    join approver in _context.profiles on lr.ApprovedBy equals approver.Id into approverGroup
                    from app in approverGroup.DefaultIfEmpty()
                    orderby lr.CreatedAt descending
                    select new
                    {
                        id = lr.Id,
                        personnelName = p.FullName,
                        leaveType = lr.LeaveType,
                        startDate = lr.StartDate,
                        endDate = lr.EndDate,
                        status = lr.Status,
                        adminNote = lr.AdminNote,
                        approvedBy = app != null ? app.FullName : null // İsim döner
                    };

        return await query.ToListAsync();
    }

    // GÜNCELLENDİ: Onaylanınca "ApprovedBy" sütununa da veri yazıyoruz
    public async Task<bool> UpdateStatusAsync(int id, string status, string? adminNote)
    {
        var request = await _context.LeaveRequests.FindAsync(id);
        if (request == null) return false;

        request.Status = status;
        request.AdminNote = adminNote; 
        
        // İşlem Onaylama veya Reddetme ise senin Admin ID'ni (a0eebc99...) veritabanına yazıyoruz
        if (status == "Approved" || status == "Rejected")
        {
            request.ApprovedBy = Guid.Parse("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UndoStatusAsync(int id)
    {
        var request = await _context.LeaveRequests.FindAsync(id);
        if (request == null) return false;

        request.Status = "Pending";
        request.AdminNote = null;
        request.ApprovedBy = null; // Geri alınınca onaylayanı da siliyoruz
        
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
        return await _context.LeaveRequests
            .Where(lr => _context.profiles
                .Any(p => p.Id == lr.UserId && p.ManagerId == managerId))
            .ToListAsync();
    }

    public async Task<bool> CreateAsync(LeaveRequest request)
    {
        _context.LeaveRequests.Add(request);
        await _context.SaveChangesAsync();
        return true;
    }

    // MOBİL İÇİN: Sadece giriş yapan kullanıcının taleplerini çeker
    public async Task<List<LeaveRequest>> GetByUserIdAsync(Guid userId)
    {
        return await _context.LeaveRequests
            .Where(lr => lr.UserId == userId)
            .OrderByDescending(lr => lr.CreatedAt)
            .ToListAsync();
    }
}
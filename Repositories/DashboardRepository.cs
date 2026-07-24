using backend.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repositories;

public class DashboardRepository
{
    private readonly AppDbContext _context;

    public DashboardRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1); 

        var totalUsers = await _context.profiles.CountAsync();

        var onLeaveCount = await _context.LeaveRequests
            .Where(lr => lr.Status == "Approved" && lr.StartDate.Date <= today && lr.EndDate.Date >= today)
            .Select(lr => lr.UserId).Distinct().CountAsync();

        var todayAttendances = await _context.Attendances
            .Where(a => a.CheckInTime >= today && a.CheckInTime < tomorrow)
            .ToListAsync();

        var presentTodayCount = todayAttendances.Select(a => a.UserId).Distinct().Count();

        var lateCount = todayAttendances
            .Where(a => a.Status == "Late") 
            .Select(a => a.UserId).Distinct().Count();

        var absentCount = totalUsers - presentTodayCount - onLeaveCount;
        if (absentCount < 0) absentCount = 0;

        var pendingLeaveCount = await _context.LeaveRequests.CountAsync(lr => lr.Status == "Pending");

        return new
        {
            totalPersonnel = totalUsers,
            activePersonnel = presentTodayCount,
            onLeavePersonnel = onLeaveCount,
            absentPersonnel = absentCount,
            latePersonnel = lateCount,
            pendingLeaves = pendingLeaveCount
        };
    }

    public async Task<object> GetOnLeaveTodayListAsync()
    {
        var today = DateTime.UtcNow.Date;
        
        return await _context.LeaveRequests
            .Where(lr => lr.Status == "Approved" && lr.StartDate.Date <= today && lr.EndDate.Date >= today)
            .Join(_context.profiles, lr => lr.UserId, p => p.Id, (lr, p) => new {
                FullName = p.FullName,
                Department = p.Department ?? "Belirtilmemiş",
                StartDate = lr.StartDate.ToString("dd.MM.yyyy"),
                EndDate = lr.EndDate.ToString("dd.MM.yyyy"),
                LeaveType = lr.LeaveType 
            }).ToListAsync();
    }

    public async Task<object> GetTrendAsync()
    {
        var totalUsers = await _context.profiles.CountAsync();
        if (totalUsers == 0) totalUsers = 1; 

        var today = DateTime.UtcNow.Date;
        var sevenDaysAgo = today.AddDays(-6); 
        
        var attendances = await _context.Attendances
            .Where(a => a.CheckInTime >= sevenDaysAgo && a.CheckInTime < today.AddDays(1))
            .ToListAsync();

        var weeklyData = new List<object>();
        var culture = new System.Globalization.CultureInfo("tr-TR");
        
        for (int i = 6; i >= 0; i--)
        {
            var targetDate = today.AddDays(-i);
            
            var present = attendances
                .Where(a => a.CheckInTime.Date == targetDate)
                .Select(a => a.UserId)
                .Distinct()
                .Count();
                
            var absent = totalUsers - present;
            if (absent < 0) absent = 0;

            var dayName = culture.DateTimeFormat.GetAbbreviatedDayName(targetDate.DayOfWeek);

            weeklyData.Add(new { day = dayName, present = present, absent = absent });
        }
        
        return weeklyData;
    }

   public async Task<object> GetRecentAttendancesAsync()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        return await _context.Attendances
            .Where(a => a.CheckInTime >= today && a.CheckInTime < tomorrow) 
            .OrderByDescending(a => a.CheckInTime)
            .Join(_context.profiles, a => a.UserId, p => p.Id, (a, p) => new {
                personnelName = p.FullName,
                role = p.Role ?? "Personel",
                department = p.Department ?? "Belirtilmemiş",
                checkIn = a.CheckInTime.ToString("HH:mm"),
                checkOut = a.CheckOutTime.HasValue ? a.CheckOutTime.Value.ToString("HH:mm") : "— (İçeride)",
                duration = a.CheckOutTime.HasValue 
                    ? $"{(int)(a.CheckOutTime.Value - a.CheckInTime).TotalHours}s {(a.CheckOutTime.Value - a.CheckInTime).Minutes}d"
                    : "Devam Ediyor",
                status = a.Status
            })
            .Take(10) 
            .ToListAsync();
    }

    public async Task<object> GetPendingLeavesAsync()
    {
        return await _context.LeaveRequests
            .Where(lr => lr.Status == "Pending")
            .Join(_context.profiles, lr => lr.UserId, p => p.Id, (lr, p) => new {
                id = lr.Id,
                personnelName = p.FullName,
                leaveType = lr.LeaveType,
                dateRange = $"{lr.StartDate:dd.MM.yyyy} - {lr.EndDate:dd.MM.yyyy}"
            })
            .OrderByDescending(x => x.id)
            .Take(5) 
            .ToListAsync();
    }

    // YENİ EKLENDİ: İzin Onay/Red işlemini veritabanına yazacak metot
    public async Task<bool> UpdateLeaveStatusAsync(int id, string status)
    {
        var leave = await _context.LeaveRequests.FindAsync(id);
        if (leave == null) return false;
        
        leave.Status = status; // "Approved" veya "Rejected" gelecek
        await _context.SaveChangesAsync();
        return true;
    }
}
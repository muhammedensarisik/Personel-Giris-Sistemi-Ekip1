using backend.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repositories;

public class ReportRepository
{
    private readonly AppDbContext _context;

    public ReportRepository(AppDbContext context)
    {
        _context = context;
    }

    // 1. BİREYSEL RAPOR İÇİN
    public async Task<object> GetIndividualReportAsync(Guid userId, DateTime startDate, DateTime endDate)
    {
        var user = await _context.profiles.FirstOrDefaultAsync(p => p.Id == userId);
        if (user == null) return null;

        var attendances = await _context.Attendances
            .Where(a => a.UserId == userId && a.CheckInTime.Date >= startDate.Date && a.CheckInTime.Date <= endDate.Date)
            .OrderByDescending(a => a.CheckInTime)
            .Select(a => new {
                Date = a.CheckInTime.ToString("yyyy-MM-dd"),
                CheckIn = a.CheckInTime.ToString("HH:mm"),
                CheckOut = a.CheckOutTime.HasValue ? a.CheckOutTime.Value.ToString("HH:mm") : "Çıkış Yapılmadı",
                Duration = a.CheckOutTime.HasValue 
                    ? Math.Round((a.CheckOutTime.Value - a.CheckInTime).TotalHours, 1) + " Saat" 
                    : "-"
            })
            .ToListAsync();

        var leaves = await _context.LeaveRequests
            .Where(l => l.UserId == userId && 
                        ((l.StartDate.Date >= startDate.Date && l.StartDate.Date <= endDate.Date) || 
                         (l.EndDate.Date >= startDate.Date && l.EndDate.Date <= endDate.Date)))
            .OrderByDescending(l => l.StartDate)
            .Select(l => new {
                StartDate = l.StartDate.ToString("yyyy-MM-dd"),
                EndDate = l.EndDate.ToString("yyyy-MM-dd"),
                Type = l.LeaveType, // <-- BURASI LeaveRequest modelindeki sütun adına göre düzeltildi!
                Status = l.Status,
                AdminNote = l.AdminNote // İstersen mentörün istediği bu notu da rapora ekleyebiliriz
            })
            .ToListAsync();

        return new
        {
            personnelName = user.FullName,
            department = user.Department,
            period = $"{startDate:dd.MM.yyyy} - {endDate:dd.MM.yyyy}",
            attendances = attendances,
            leaves = leaves
        };
    }

    // 2. TOPLU RAPOR İÇİN
    public async Task<object> GetBulkReportAsync()
    {
        var currentMonth = DateTime.UtcNow.Month;
        var currentYear = DateTime.UtcNow.Year;

        var allUsers = await _context.profiles.ToListAsync();

        var thisMonthAttendances = await _context.Attendances
            .Where(a => a.CheckInTime.Month == currentMonth && a.CheckInTime.Year == currentYear)
            .ToListAsync();

        var thisMonthLeaves = await _context.LeaveRequests
            .Where(l => l.Status == "Approved" && 
                       (l.StartDate.Month == currentMonth || l.EndDate.Month == currentMonth) && 
                       l.StartDate.Year == currentYear)
            .ToListAsync();

        var bulkReport = allUsers.Select(user => 
        {
            var userAttendances = thisMonthAttendances.Where(a => a.UserId == user.Id).ToList();
            
            var totalHours = userAttendances
                .Where(a => a.CheckOutTime.HasValue)
                .Sum(a => (a.CheckOutTime.Value - a.CheckInTime).TotalHours);

            var lateDays = userAttendances.Count(a => a.CheckInTime.TimeOfDay > new TimeSpan(8, 30, 0));

            var userLeaves = thisMonthLeaves.Where(l => l.UserId == user.Id).ToList();
            var leaveDays = userLeaves.Sum(l => (l.EndDate.Date - l.StartDate.Date).Days + 1);

            return new 
            {
                personnelName = user.FullName,
                department = user.Department ?? "Belirtilmemiş",
                totalWorkHours = Math.Round(totalHours, 1) + " Saat",
                lateDaysCount = lateDays,
                leaveDaysCount = leaveDays
            };
        }).OrderBy(x => x.personnelName).ToList();

        return bulkReport;
    }
}
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Repositories
{
    public class AttendanceRepository 
    {
        private readonly AppDbContext _context;
        
        public AttendanceRepository(AppDbContext context) 
        { 
            _context = context; 
        }

        public async Task<Attendance?> GetActiveAttendanceAsync(Guid userId, DateTime today)
        {
            // Giriş yapılmış ama henüz çıkış saati basılmamış (AÇIK) mesaiyi doğrudan çekiyoruz
            return await _context.Attendances
                .FirstOrDefaultAsync(a => a.UserId == userId && a.CheckOutTime == null);
        }

        // Yeni Mesai Başlat (Giriş)
        // Yeni Mesai Başlat (Giriş)
        public async Task CheckInAsync(Guid userId, int locationId)
        {
            var attendance = new Attendance
            {
                UserId = userId,
                LocationId = locationId,
                CheckInTime = DateTime.UtcNow,
                CheckOutTime = null,
                Status = "Aktif" // VERİTABANI KURALI: Status boş geçilemediği için varsayılan bir değer atıyoruz! (Prondakine göre "Devam Ediyor" da yapabilirsin)
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();
        }

        public async Task CheckOutAsync(Attendance attendance)
        {
            // Giriş saatinin UTC Kind durumunu garantiye alıyoruz
            if (attendance.CheckInTime.Kind == DateTimeKind.Unspecified)
            {
                attendance.CheckInTime = DateTime.SpecifyKind(attendance.CheckInTime, DateTimeKind.Utc);
            }

            attendance.CheckOutTime = DateTime.UtcNow;
            attendance.Status = "Tamamlandı";

            await _context.SaveChangesAsync();
        }
        
                public async Task<List<Attendance>> GetAllAsync() 
        {
            return await _context.Attendances
                .OrderByDescending(a => a.CheckInTime)
                .ToListAsync();
        }

        // 2. MANAGER İÇİN: Sadece kendi altındaki personellerin geçmişini getirir
        public async Task<List<Attendance>> GetTeamHistoryAsync(Guid managerId) 
        {
            // ManagerId'si bu yöneticiye eşit olan personellerin ID'lerini buluyoruz
            var teamUserIds = await _context.profiles
                .Where(p => p.ManagerId == managerId)
                .Select(p => p.Id)
                .ToListAsync();

            // Sadece o personellere ait giriş-çıkışları çekiyoruz
            return await _context.Attendances
                .Where(a => teamUserIds.Contains(a.UserId))
                .OrderByDescending(a => a.CheckInTime)
                .ToListAsync();
        }

        // 3. MOBİL (USER/MANAGER) İÇİN: Sadece kendi geçmişini getirir
        public async Task<List<Attendance>> GetByUserIdAsync(Guid userId) 
        {
            return await _context.Attendances
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CheckInTime) 
                .ToListAsync();
        }
    }
}
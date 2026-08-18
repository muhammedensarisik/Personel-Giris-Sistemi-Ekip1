using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupportTicketsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupportTicketsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Yeni Destek Talebi Oluşturma
        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] SupportTicketCreateDto dto)
        {
            var ticket = new SupportTicket
            {
                PersonnelId = dto.PersonnelId,
                TargetManagerId = dto.TargetManagerId,
                Subject = dto.Subject,
                Message = dto.Message,
                ImagePath = dto.ImagePath,
                Status = "Beklemede",
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Destek talebi başarıyla oluşturuldu." });
        }

        // 2. Talepleri Listeleme (Personel İsimleri ve Departman Join/Include ile)
        [HttpGet("list/{userId}")]
        public async Task<IActionResult> GetTickets(Guid userId, [FromQuery] string role)
        {
            var query = from ticket in _context.SupportTickets
                        join personnel in _context.profiles on ticket.PersonnelId equals personnel.Id into pGroup
                        from p in pGroup.DefaultIfEmpty()
                        join manager in _context.profiles on ticket.TargetManagerId equals manager.Id into mGroup
                        from m in mGroup.DefaultIfEmpty()
                        select new
                        {
                            Id = ticket.Id,
                            PersonnelId = ticket.PersonnelId,
                            PersonnelName = p != null ? p.FullName : "Bilinmeyen Personel",
                            PersonnelFullName = p != null ? p.FullName : "Bilinmeyen Personel",
                            Department = p != null ? p.Department : "Genel Kadro",
                            TargetManagerId = ticket.TargetManagerId,
                            TargetManagerName = m != null ? m.FullName : "Genel Yönetici",
                            Subject = ticket.Subject,
                            Message = ticket.Message,
                            ImagePath = ticket.ImagePath,
                            Status = ticket.Status,
                            CreatedAt = ticket.CreatedAt
                        };

            // Eğer kullanıcı Admin ise tüm biletleri döndür
            if (role?.ToLower() == "admin")
            {
                var allTickets = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
                return Ok(allTickets);
            }

            var managerTickets = await query
                .Where(t => t.TargetManagerId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(managerTickets);
        }

        // 2b. Tüm Biletleri Getir (Admin View Endpoint)
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllAdminTickets()
        {
            var allTickets = await (from ticket in _context.SupportTickets
                                    join personnel in _context.profiles on ticket.PersonnelId equals personnel.Id into pGroup
                                    from p in pGroup.DefaultIfEmpty()
                                    join manager in _context.profiles on ticket.TargetManagerId equals manager.Id into mGroup
                                    from m in mGroup.DefaultIfEmpty()
                                    select new
                                    {
                                        Id = ticket.Id,
                                        PersonnelId = ticket.PersonnelId,
                                        PersonnelName = p != null ? p.FullName : "Bilinmeyen Personel",
                                        PersonnelFullName = p != null ? p.FullName : "Bilinmeyen Personel",
                                        Department = p != null ? p.Department : "Genel Kadro",
                                        TargetManagerId = ticket.TargetManagerId,
                                        TargetManagerName = m != null ? m.FullName : "Genel Yönetici",
                                        Subject = ticket.Subject,
                                        Message = ticket.Message,
                                        ImagePath = ticket.ImagePath,
                                        Status = ticket.Status,
                                        CreatedAt = ticket.CreatedAt
                                    })
                                    .OrderByDescending(t => t.CreatedAt)
                                    .ToListAsync();

            return Ok(allTickets);
        }

        // 3. Personelin Kendi Biletlerini Listelemesi
        [HttpGet("my-tickets/{personnelId}")]
        public async Task<IActionResult> GetMyTickets(Guid personnelId)
        {
            var myTickets = await (from ticket in _context.SupportTickets
                                   where ticket.PersonnelId == personnelId
                                   join personnel in _context.profiles on ticket.PersonnelId equals personnel.Id into pGroup
                                   from p in pGroup.DefaultIfEmpty()
                                   join manager in _context.profiles on ticket.TargetManagerId equals manager.Id into mGroup
                                   from m in mGroup.DefaultIfEmpty()
                                   select new
                                   {
                                       Id = ticket.Id,
                                       PersonnelId = ticket.PersonnelId,
                                       PersonnelName = p != null ? p.FullName : "Bilinmeyen Personel",
                                       PersonnelFullName = p != null ? p.FullName : "Bilinmeyen Personel",
                                       Department = p != null ? p.Department : "Genel Kadro",
                                       TargetManagerId = ticket.TargetManagerId,
                                       TargetManagerName = m != null ? m.FullName : "Genel Yönetici",
                                       Subject = ticket.Subject,
                                       Message = ticket.Message,
                                       ImagePath = ticket.ImagePath,
                                       Status = ticket.Status,
                                       CreatedAt = ticket.CreatedAt
                                   })
                                   .OrderByDescending(t => t.CreatedAt)
                                   .ToListAsync();

            return Ok(myTickets);
        }

        // 4. Bilet Durumunu Güncelleme (PUT /api/SupportTickets/{id}/status)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateTicketStatus(Guid id, [FromBody] UpdateSupportTicketStatusDto dto)
        {
            var ticket = await _context.SupportTickets.FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null)
            {
                return NotFound(new { success = false, message = "Destek bileti bulunamadı." });
            }

            if (dto != null && !string.IsNullOrWhiteSpace(dto.Status))
            {
                ticket.Status = dto.Status;
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Bilet durumu başarıyla güncellendi.", status = ticket.Status });
        }
    }
}
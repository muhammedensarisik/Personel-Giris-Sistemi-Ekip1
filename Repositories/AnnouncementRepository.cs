using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class AnnouncementRepository
{
    private readonly AppDbContext _context;

    public AnnouncementRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnnouncementDto>> GetVisibleAnnouncementsAsync(Guid requesterId, string requesterRole, Guid? requesterManagerId)
    {
        var adminIds = await _context.profiles
            .Where(p => p.Role == "Admin")
            .Select(p => p.Id)
            .ToListAsync();

        var query = _context.Announcements.AsQueryable();

        if (requesterRole == "Manager")
        {
            query = query.Where(a => a.AuthorId == requesterId || (a.AuthorId.HasValue && adminIds.Contains(a.AuthorId.Value)));
        }
        else if (requesterRole == "User")
        {
            query = query.Where(a => a.AuthorId == requesterManagerId || (a.AuthorId.HasValue && adminIds.Contains(a.AuthorId.Value)));
        }

        var result = await (from a in query
                            join p in _context.profiles on a.AuthorId equals p.Id into pGroup
                            from p in pGroup.DefaultIfEmpty()
                            orderby a.CreatedAt descending
                            select new AnnouncementDto
                            {
                                Id = a.Id,
                                Title = a.Title,
                                Content = a.Content,
                                Priority = a.Priority,
                                AuthorName = p != null ? p.FullName : "Sistem",
                                AuthorRole = p != null ? p.Role : "Sistem",
                                CreatedAt = a.CreatedAt
                            }).ToListAsync();

        return result;
    }
    
    public async Task AddAsync(Announcement announcement)
    {
        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var announcement = await _context.Announcements.FindAsync(id);
        if (announcement != null)
        {
            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
        }
    }

}

public class AnnouncementDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? Priority { get; set; }
    public string? AuthorName { get; set; }
    public string? AuthorRole { get; set; }
    public DateTime CreatedAt { get; set; }
}
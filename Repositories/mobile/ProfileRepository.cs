using Microsoft.EntityFrameworkCore;
using backend.Data; 
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MobilArayuz.API.Repositories
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly AppDbContext _context;

        public ProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<object> GetUserProfileAsync(Guid userId)
        {
            var profile = await _context.profiles
                .Where(u => u.Id == userId)
                .Select(u => new 
                {
                    FullName = u.FullName,
                    Department = u.Department ?? "Departman Belirtilmemiş",
                    Title = u.Role ?? "Personel",
                    Email = u.Email,
                    PhoneNumber = "Kayıtlı Değil" // Modelde olmadığı için geçici metin
                })
                .FirstOrDefaultAsync();

            return profile;
        }

       public async Task<bool> UpdateContactInfoAsync(Guid userId, string email, string phone)
{
    var user = await _context.profiles.FirstOrDefaultAsync(u => u.Id == userId);
    
    if (user == null) return false;

    // Sadece Email alanının değerini değiştiriyoruz
    user.Email = email;

    // KRİTİK ÇÖZÜM: Entity Framework'e sadece 'email' kolonunun değiştirildiğini söylüyoruz.
    // Böylece 'created_at' dahil diğer hiçbir kolon veritabanına gönderilmez, tarih hatası tamamen ortadan kalkar!
    _context.Entry(user).Property(u => u.Email).IsModified = true;

    var result = await _context.SaveChangesAsync();
    return result > 0;
}
    }
}
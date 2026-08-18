using System;
using System.Threading.Tasks;

namespace MobilArayuz.API.Repositories
{
    public interface IProfileRepository
    {
        Task<object> GetUserProfileAsync(Guid userId);
        Task<bool> UpdateContactInfoAsync(Guid userId, string email, string phone);
    }
}
using Microsoft.AspNetCore.Mvc;
using MobilArayuz.API.Repositories;
using System; // Guid kullanabilmek için bu şart
using System.Threading.Tasks;

namespace MobilArayuz.API.Controllers.mobile
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileRepository _profileRepository;

        // Dependency Injection ile Repo'yu Controller'a bağlıyoruz
        public ProfileController(IProfileRepository profileRepository)
        {
            _profileRepository = profileRepository;
        }

        // GET: api/profile/me/{userId}
        [HttpGet("me/{userId}")]
        public async Task<IActionResult> GetMyProfile(Guid userId)
        {
            var profile = await _profileRepository.GetUserProfileAsync(userId);
            
            if (profile == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            return Ok(profile);
        }

        // PUT: api/profile/update-contact/{userId}
        [HttpPut("update-contact/{userId}")]
        public async Task<IActionResult> UpdateContact(Guid userId, [FromBody] UpdateContactRequest request) // DİKKAT: int yerine Guid oldu!
        {
            var isUpdated = await _profileRepository.UpdateContactInfoAsync(userId, request.Email, request.PhoneNumber);

            if (!isUpdated)
                return BadRequest(new { message = "Bilgiler güncellenemedi veya kullanıcı bulunamadı." });

            return Ok(new { message = "İletişim bilgileri başarıyla güncellendi." });
        }
    }

    // --- DTO DOSYASI AÇMAMAK İÇİN BURAYA EKLEDİK ---
    // Flutter'dan gelen JSON'ı yakalayan model
    public class UpdateContactRequest
    {
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
    }
}
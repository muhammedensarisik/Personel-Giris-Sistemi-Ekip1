using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using backend.Models;

namespace backend.Controllers;

[Route("api/leaverequest")]
[ApiController]
public class LeaveRequestController : ControllerBase 
{
    private readonly LeaveRequestRepository _repo;

    public LeaveRequestController(LeaveRequestRepository repo) 
    { 
        _repo = repo; 
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() 
    {
        return Ok(await _repo.GetAllAsync());
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        var result = await _repo.UpdateStatusAsync(id, status);
        if (!result) return NotFound(new { message = "İzin talebi bulunamadı." });
        
        return Ok(new { message = "İzin durumu başarıyla güncellendi." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _repo.DeleteAsync(id);
        if (!result) return NotFound(new { message = "İzin talebi bulunamadı." });
        
        return Ok(new { message = "İzin talebi silindi." });
    }

    // DOĞRU OLAN BURASI: Controller sadece repoyu çağırır, _context kullanmaz.
    [HttpGet("manager/{managerId}")]
    public async Task<IActionResult> GetByManager(Guid managerId)
    {
        var data = await _repo.GetByManagerIdAsync(managerId);
        if (data == null || !data.Any()) 
            return Ok(new List<LeaveRequest>());

        return Ok(data);
    }
}
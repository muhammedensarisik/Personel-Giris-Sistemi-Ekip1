using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using System.Threading.Tasks;

namespace backend.Controllers;

[Route("api/dashboard")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly DashboardRepository _repo;

    public DashboardController(DashboardRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await _repo.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("on-leave-today")]
    public async Task<IActionResult> GetOnLeaveTodayList()
    {
        var list = await _repo.GetOnLeaveTodayListAsync();
        return Ok(list);
    }

    [HttpGet("trend")]
    public async Task<IActionResult> GetTrend()
    {
        var trend = await _repo.GetTrendAsync();
        return Ok(trend);
    }

    [HttpGet("pending-leaves")]
    public async Task<IActionResult> GetPendingLeaves()
    {
        var list = await _repo.GetPendingLeavesAsync();
        return Ok(list);
    }

    // YENİ EKLENDİ: Ana tabloyu besleyecek kapı
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentAttendances()
    {
        var list = await _repo.GetRecentAttendancesAsync();
        return Ok(list);
    }

    // YENİ EKLENDİ: İzin Onay/Red kapısı
    [HttpPut("leave/{id}/status")]
    public async Task<IActionResult> UpdateLeaveStatus(int id, [FromBody] LeaveStatusDto dto)
    {
        var result = await _repo.UpdateLeaveStatusAsync(id, dto.Status);
        if (!result) return NotFound(new { message = "İzin bulunamadı" });
        return Ok(new { message = "İzin güncellendi" });
    }
}

// İzin durumu güncellerken gelecek JSON verisini karşılayan sınıf
public class LeaveStatusDto
{
    public string Status { get; set; }
}
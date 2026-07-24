using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using System.Threading.Tasks;
using System;

namespace backend.Controllers;

[Route("api/reports")]
[ApiController]
public class ReportController : ControllerBase
{
    private readonly ReportRepository _repo;

    public ReportController(ReportRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("individual")]
    public async Task<IActionResult> GetIndividualReport([FromQuery] Guid userId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var reportData = await _repo.GetIndividualReportAsync(userId, startDate, endDate);
        
        if (reportData == null)
            return NotFound(new { message = "Personel bulunamadı veya veri yok." });

        return Ok(reportData);
    }

    [HttpGet("bulk")]
    public async Task<IActionResult> GetBulkReport()
    {
        var reportData = await _repo.GetBulkReportAsync();
        return Ok(reportData);
    }
}
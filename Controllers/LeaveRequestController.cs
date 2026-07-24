using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateLeaveStatusDto request)
    {
        var result = await _repo.UpdateStatusAsync(id, request.Status, request.AdminNote);
        if (!result) return NotFound(new { message = "İzin talebi bulunamadı." });
        
        return Ok(new { message = "İzin durumu başarıyla güncellendi." });
    }

    // YENİ EKLENDİ: Geri Alma (Undo) Endpoint'i
    [HttpPut("{id}/undo")]
    public async Task<IActionResult> UndoStatus(int id)
    {
        var result = await _repo.UndoStatusAsync(id);
        if (!result) return NotFound(new { message = "İzin talebi bulunamadı." });
        
        return Ok(new { message = "İzin talebi başarıyla geri alındı (Pending konumuna çekildi)." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _repo.DeleteAsync(id);
        if (!result) return NotFound(new { message = "İzin talebi bulunamadı." });
        
        return Ok(new { message = "İzin talebi silindi." });
    }

    [HttpGet("manager/{managerId}")]
    public async Task<IActionResult> GetByManager(Guid managerId)
    {
        var data = await _repo.GetByManagerIdAsync(managerId);
        if (data == null || !data.Any()) 
            return Ok(new List<LeaveRequest>());

        return Ok(data);
    }
}

public class UpdateLeaveStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
}
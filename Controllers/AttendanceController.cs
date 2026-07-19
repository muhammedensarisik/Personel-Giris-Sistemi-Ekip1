using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AttendanceController : ControllerBase 
{
    private readonly AttendanceRepository _repo;

    public AttendanceController(AttendanceRepository repo) 
    { 
        _repo = repo; 
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() 
    {
        var data = await _repo.GetAllAsync();
        return Ok(data);
    }
}
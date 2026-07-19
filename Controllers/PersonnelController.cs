using Microsoft.AspNetCore.Mvc;
using backend.Repositories;
using backend.Models;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PersonnelController : ControllerBase 
{
    private readonly PersonnelRepository _repo; // Context yerine Repo geldi

    public PersonnelController(PersonnelRepository repo) 
    { 
        _repo = repo; 
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() 
    {
        var data = await _repo.GetAllAsync();
        return Ok(data);
    }

    [HttpGet("managers")]
    public async Task<IActionResult> GetManagers()
    {
        var managers = await _repo.GetManagersAsync();
        return Ok(managers);
    }
}
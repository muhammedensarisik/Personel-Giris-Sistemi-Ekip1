using Microsoft.AspNetCore.Mvc;
using backend.Repositories;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OvertimeController : ControllerBase {
    private readonly OvertimeRepository _repo;
    public OvertimeController(OvertimeRepository repo) { _repo = repo; }

    [HttpGet]
    public async Task<IActionResult> GetAll() {
        return Ok(await _repo.GetAllAsync());
    }
}
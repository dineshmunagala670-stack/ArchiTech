using Microsoft.AspNetCore.Mvc;

namespace ArchiTechDotnetApi.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "Hello from ArchiTech .NET!" });
    }
}
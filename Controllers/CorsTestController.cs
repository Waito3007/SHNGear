using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowFrontend")]
    public class CorsTestController : ControllerBase
    {
        private readonly ILogger<CorsTestController> _logger;

        public CorsTestController(ILogger<CorsTestController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Simple endpoint to test CORS configuration
        /// </summary>
        [HttpGet("test")]
        public IActionResult TestCors()
        {
            _logger.LogInformation("CORS test endpoint called");
            return Ok(new { 
                message = "CORS is working!", 
                timestamp = DateTime.UtcNow,
                origin = Request.Headers["Origin"].ToString(),
                userAgent = Request.Headers["User-Agent"].ToString()
            });
        }

        /// <summary>
        /// Test OPTIONS preflight request
        /// </summary>
        [HttpOptions("test")]
        public IActionResult TestCorsOptions()
        {
            _logger.LogInformation("CORS OPTIONS test endpoint called");
            return Ok();
        }

        /// <summary>
        /// Test POST request with CORS
        /// </summary>
        [HttpPost("test")]
        public IActionResult TestCorsPost([FromBody] dynamic data)
        {
            _logger.LogInformation("CORS POST test endpoint called");
            return Ok(new { 
                message = "CORS POST is working!", 
                receivedData = data,
                timestamp = DateTime.UtcNow
            });
        }
    }
}

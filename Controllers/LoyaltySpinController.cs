using Microsoft.AspNetCore.Mvc;
using SHN_Gear.Services;
using System.Threading.Tasks;
using SHN_Gear.Models;
using System.Collections.Generic;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoyaltySpinController : ControllerBase
    {
        private readonly LoyaltySpinService _service;
        public LoyaltySpinController(LoyaltySpinService service)
        {
            _service = service;
        }
        // GET: api/LoyaltySpin/points/{userId}
        [HttpGet("points/{userId}")]
        public async Task<ActionResult<int>> GetUserPoints(int userId)
        {
            return await _service.GetUserPointsAsync(userId);
        }

        // POST: api/LoyaltySpin/points/{userId}
        [HttpPost("points/{userId}")]
        public async Task<IActionResult> SetUserPoints(int userId, [FromBody] int points)
        {
            await _service.SetUserPointsAsync(userId, points);
            return Ok();
        }
        // POST: api/LoyaltySpin/config
        [HttpPost("config")]
        public async Task<IActionResult> UpdateSpinConfig([FromBody] SpinConfig config)
        {
            await _service.UpdateSpinConfigAsync(config);
            return Ok();
        }
        // GET: api/LoyaltySpin/config
        [HttpGet("config")]
        public async Task<ActionResult<SpinConfig>> GetSpinConfig()
        {
            return await _service.GetSpinConfigAsync();
        }
        // PUT: api/LoyaltySpin/config
        [HttpPut("config")]
        public async Task<IActionResult> PutSpinConfig([FromBody] SpinConfig config)
        {
            await _service.UpdateSpinConfigAsync(config);
            return Ok();
        }
        // GET: api/LoyaltySpin/items
        [HttpGet("items")]
        public async Task<ActionResult<List<SpinItem>>> GetSpinItems()
        {
            return await _service.GetSpinItemsAsync();
        }

        // POST: api/LoyaltySpin/spin/{userId}
        [HttpPost("spin/{userId}")]
        public async Task<ActionResult<SpinHistory>> Spin(int userId)
        {
            try
            {
                var result = await _service.SpinAsync(userId);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/LoyaltySpin/history/{userId}
        [HttpGet("history/{userId}")]
        public async Task<ActionResult<List<SpinHistory>>> GetUserSpinHistory(int userId)
        {
            return await _service.GetUserSpinHistoryAsync(userId);
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using SHN_Gear.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentMethodController : ControllerBase
    {
        private readonly AppDbContext _context; // Thay bằng tên DbContext của bạn

        public PaymentMethodController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/PaymentMethod
        [HttpPost]
        public async Task<IActionResult> AddPaymentMethod([FromBody] PaymentMethod paymentMethod)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.PaymentMethods.Add(paymentMethod);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPaymentMethod), new { id = paymentMethod.Id }, paymentMethod);
        }

        // GET: api/PaymentMethod/{id} (Để kiểm tra sau khi thêm)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentMethod(int id)
        {
            var paymentMethod = await _context.PaymentMethods.FindAsync(id);
            if (paymentMethod == null)
            {
                return NotFound();
            }
            return Ok(paymentMethod);
        }
    }
}
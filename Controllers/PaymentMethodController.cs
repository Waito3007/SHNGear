using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentMethodController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentMethodController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/PaymentMethod
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentMethod>>> GetPaymentMethods()
        {
            return await _context.PaymentMethods.ToListAsync();
        }

        // GET: api/PaymentMethod/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentMethod>> GetPaymentMethod(int id)
        {
            var paymentMethod = await _context.PaymentMethods.FindAsync(id);

            if (paymentMethod == null)
            {
                return NotFound();
            }

            return paymentMethod;
        }

        // POST: api/PaymentMethod
        [HttpPost]
        public async Task<ActionResult<PaymentMethod>> PostPaymentMethod(PaymentMethod paymentMethod)
        {
            _context.PaymentMethods.Add(paymentMethod);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPaymentMethod", new { id = paymentMethod.Id }, paymentMethod);
        }

        // PUT: api/PaymentMethod/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPaymentMethod(int id, PaymentMethod paymentMethod)
        {
            if (id != paymentMethod.Id)
            {
                return BadRequest();
            }

            _context.Entry(paymentMethod).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PaymentMethodExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/PaymentMethod/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaymentMethod(int id)
        {
            var paymentMethod = await _context.PaymentMethods.FindAsync(id);
            if (paymentMethod == null)
            {
                return NotFound();
            }

            _context.PaymentMethods.Remove(paymentMethod);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PaymentMethodExists(int id)
        {
            return _context.PaymentMethods.Any(e => e.Id == id);
        }

        // Thêm endpoint để seed dữ liệu phương thức thanh toán mẫu
        [HttpPost("seed")]
        public async Task<IActionResult> SeedPaymentMethods()
        {
            if (await _context.PaymentMethods.AnyAsync())
            {
                return Conflict("Payment methods already exist in database");
            }

            var paymentMethods = new List<PaymentMethod>
            {
                new PaymentMethod
                {
                    Id = 1,
                    Name = "Tiền mặt khi nhận hàng",
                    Description = "Thanh toán bằng tiền mặt khi nhận hàng"
                },
                new PaymentMethod
                {
                    Id = 2,
                    Name = "Ví điện tử MoMo",
                    Description = "Thanh toán qua ứng dụng MoMo"
                }
            };

            await _context.PaymentMethods.AddRangeAsync(paymentMethods);
            await _context.SaveChangesAsync();

            return Ok("Payment methods seeded successfully");
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/address")]
    public class AddressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddressController(AppDbContext context)
        {
            _context = context;
        }

        // Thêm địa chỉ mới
        [HttpPost("add")]
        public async Task<IActionResult> AddAddress([FromBody] Address address)
        {
            if (address.UserId.HasValue)
            {
                var user = await _context.Users.FindAsync(address.UserId.Value);
                if (user == null)
                {
                    return NotFound("Người dùng không tồn tại.");
                }
            }

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Địa chỉ đã được thêm.", AddressId = address.Id });
        }

        // Lấy địa chỉ theo UserId
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetAddressesByUserId(int userId)
        {
            var addresses = await _context.Addresses
                .Where(a => a.UserId == userId)
                .ToListAsync();

            return Ok(addresses);
        }

        // Cập nhật địa chỉ
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] CreateAddressDTO addressDTO)
        {
            var address = await _context.Addresses.FindAsync(id);
            if (address == null)
            {
                return NotFound("Địa chỉ không tồn tại.");
            }

            address.FullName = addressDTO.FullName;
            address.PhoneNumber = addressDTO.PhoneNumber;
            address.AddressLine1 = addressDTO.AddressLine1;
            address.AddressLine2 = addressDTO.AddressLine2;
            address.City = addressDTO.City;
            address.State = addressDTO.State;
            address.ZipCode = addressDTO.ZipCode;
            address.Country = addressDTO.Country;

            _context.Addresses.Update(address);
            await _context.SaveChangesAsync();

            return Ok(address);
        }

        // Xóa địa chỉ
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var address = await _context.Addresses.FindAsync(id);
            if (address == null)
            {
                return NotFound("Địa chỉ không tồn tại.");
            }

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();

            return Ok("Địa chỉ đã được xóa.");
        }
    }
}

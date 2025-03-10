using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddressController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách địa chỉ của một User
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserAddresses(int userId)
        {
            var addresses = await _context.Addresses
                .Where(a => a.UserId == userId)
                .ToListAsync();

            if (!addresses.Any())
            {
                return NotFound("Không tìm thấy địa chỉ nào cho user này.");
            }

            return Ok(addresses);
        }

        // Thêm địa chỉ mới
        [HttpPost("add")]
        public async Task<IActionResult> AddAddress([FromBody] CreateAddressDTO addressDTO)
        {
            // Kiểm tra User có tồn tại không
            var user = await _context.Users.FindAsync(addressDTO.UserId);
            if (user == null)
            {
                return BadRequest("User không tồn tại.");
            }

            var address = new Address
            {
                UserId = addressDTO.UserId,
                FullName = addressDTO.FullName,
                PhoneNumber = addressDTO.PhoneNumber,
                AddressLine1 = addressDTO.AddressLine1,
                AddressLine2 = addressDTO.AddressLine2,
                City = addressDTO.City,
                State = addressDTO.State,
                ZipCode = addressDTO.ZipCode,
                Country = addressDTO.Country
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            return Ok(address);
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

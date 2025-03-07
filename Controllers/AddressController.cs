using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [Route("api/address")]
    [ApiController]
    public class AddressController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AddressController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ 1. Lấy danh sách địa chỉ của người dùng
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAddresses(string userId)
        {
            var addresses = await _context.Addresses
                .Where(a => a.UserId == userId)
                .Select(a => new AddressDTO
                {
                    Id = a.Id,
                    FullName = a.FullName,
                    PhoneNumber = a.PhoneNumber,
                    AddressLine1 = a.AddressLine1,
                    AddressLine2 = a.AddressLine2,
                    City = a.City,
                    State = a.State,
                    ZipCode = a.ZipCode,
                    Country = a.Country
                })
                .ToListAsync();

            return Ok(addresses);
        }

        // ✅ 2. Thêm địa chỉ mới
        [HttpPost("add")]
        public async Task<IActionResult> AddAddress([FromBody] CreateAddressDTO addressDTO)
        {
            if (addressDTO == null)
            {
                return BadRequest("Invalid data.");
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

            return Ok(new { message = "Địa chỉ đã được thêm!", addressId = address.Id });
        }

        // ✅ 3. Cập nhật địa chỉ
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] AddressDTO addressDTO)
        {
            var address = await _context.Addresses.FindAsync(id);
            if (address == null)
            {
                return NotFound("Không tìm thấy địa chỉ.");
            }

            address.FullName = addressDTO.FullName;
            address.PhoneNumber = addressDTO.PhoneNumber;
            address.AddressLine1 = addressDTO.AddressLine1;
            address.AddressLine2 = addressDTO.AddressLine2;
            address.City = addressDTO.City;
            address.State = addressDTO.State;
            address.ZipCode = addressDTO.ZipCode;
            address.Country = addressDTO.Country;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật địa chỉ thành công!" });
        }

        // ✅ 4. Xóa địa chỉ
        [HttpDelete("remove/{id}")]
        public async Task<IActionResult> RemoveAddress(int id)
        {
            var address = await _context.Addresses.FindAsync(id);
            if (address == null)
            {
                return NotFound("Không tìm thấy địa chỉ.");
            }

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa địa chỉ thành công!" });
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/specifications")]
    public class SpecificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SpecificationController(AppDbContext context)
        {
            _context = context;
        }

        // 🟢 Thêm thông số kỹ thuật cho điện thoại
        [HttpPost("phone")]
        public async Task<IActionResult> AddPhoneSpecification([FromBody] PhoneSpecificationDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            var phoneSpec = new PhoneSpecification
            {
                ProductId = dto.ProductId,
                ScreenSize = dto.ScreenSize,
                Resolution = dto.Resolution,
                ScreenType = dto.ScreenType,
                Weight = dto.Weight,
                Material = dto.Material,
                CPUModel = dto.CPUModel,
                CPUCores = dto.CPUCores,
                RAM = dto.RAM,
                InternalStorage = dto.InternalStorage,
                FrontCamera = dto.FrontCamera,
                RearCamera = dto.RearCamera,
                BatteryCapacity = dto.BatteryCapacity,
                SupportsNFC = dto.SupportsNFC
            };

            _context.PhoneSpecifications.Add(phoneSpec);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thông số điện thoại đã được thêm." });
        }

        // 🟢 Thêm thông số kỹ thuật cho laptop
        [HttpPost("laptop")]
        public async Task<IActionResult> AddLaptopSpecification([FromBody] LaptopSpecificationDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            var laptopSpec = new LaptopSpecification
            {
                ProductId = dto.ProductId,
                Weight = dto.Weight,
                Material = dto.Material,
                CPUType = dto.CPUType,
                CPUNumberOfCores = dto.CPUNumberOfCores,
                RAM = dto.RAM,
                MaxRAMSupport = dto.MaxRAMSupport,
                SSDStorage = dto.SSDStorage,
                ScreenSize = dto.ScreenSize,
                Resolution = dto.Resolution,
                RefreshRate = dto.RefreshRate,
                SupportsTouch = dto.SupportsTouch
            };

            _context.LaptopSpecifications.Add(laptopSpec);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thông số laptop đã được thêm." });
        }

        // 🟢 Thêm thông số kỹ thuật cho tai nghe
        [HttpPost("headphone")]
        public async Task<IActionResult> AddHeadphoneSpecification([FromBody] HeadphoneSpecificationDto dto)
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            var headphoneSpec = new HeadphoneSpecification
            {
                ProductId = dto.ProductId,
                Weight = dto.Weight,
                Type = dto.Type,
                ConnectionType = dto.ConnectionType,
                Port = dto.Port
            };

            _context.HeadphoneSpecifications.Add(headphoneSpec);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thông số tai nghe đã được thêm." });
        }

        // 🔵 Lấy thông số kỹ thuật của điện thoại
        [HttpGet("phone/{productId}")]
        public async Task<IActionResult> GetPhoneSpecification(int productId)
        {
            var spec = await _context.PhoneSpecifications.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (spec == null) return NotFound("Không tìm thấy thông số kỹ thuật cho điện thoại này.");

            return Ok(spec);
        }

        // 🔵 Lấy thông số kỹ thuật của laptop
        [HttpGet("laptop/{productId}")]
        public async Task<IActionResult> GetLaptopSpecification(int productId)
        {
            var spec = await _context.LaptopSpecifications.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (spec == null) return NotFound("Không tìm thấy thông số kỹ thuật cho laptop này.");

            return Ok(spec);
        }

        // 🔵 Lấy thông số kỹ thuật của tai nghe
        [HttpGet("headphone/{productId}")]
        public async Task<IActionResult> GetHeadphoneSpecification(int productId)
        {
            var spec = await _context.HeadphoneSpecifications.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (spec == null) return NotFound("Không tìm thấy thông số kỹ thuật cho tai nghe này.");

            return Ok(spec);
        }

        // 🔴 Xóa thông số kỹ thuật của điện thoại
        [HttpDelete("phone/{productId}")]
        public async Task<IActionResult> DeletePhoneSpecification(int productId)
        {
            var spec = await _context.PhoneSpecifications.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (spec == null) return NotFound("Không tìm thấy thông số kỹ thuật của điện thoại này.");

            _context.PhoneSpecifications.Remove(spec);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thông số điện thoại đã được xóa." });
        }

        // 🔴 Xóa thông số kỹ thuật của laptop
        [HttpDelete("laptop/{productId}")]
        public async Task<IActionResult> DeleteLaptopSpecification(int productId)
        {
            var spec = await _context.LaptopSpecifications.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (spec == null) return NotFound("Không tìm thấy thông số kỹ thuật của laptop này.");

            _context.LaptopSpecifications.Remove(spec);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thông số laptop đã được xóa." });
        }

        // 🔴 Xóa thông số kỹ thuật của tai nghe
        [HttpDelete("headphone/{productId}")]
        public async Task<IActionResult> DeleteHeadphoneSpecification(int productId)
        {
            var spec = await _context.HeadphoneSpecifications.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (spec == null) return NotFound("Không tìm thấy thông số kỹ thuật của tai nghe này.");

            _context.HeadphoneSpecifications.Remove(spec);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thông số tai nghe đã được xóa." });
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpecificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SpecificationsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Specifications/PhoneSpecifications
        [HttpPost("PhoneSpecifications")]
        public async Task<ActionResult<PhoneSpecification>> CreatePhoneSpecification([FromBody] PhoneSpecificationDto specDto)
        {
            var product = await _context.Products.FindAsync(specDto.ProductId);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }

            var phoneSpec = new PhoneSpecification
            {
                ProductId = specDto.ProductId,
                Product = product, // Liên kết với sản phẩm hiện có
                ScreenSize = specDto.ScreenSize,
                Resolution = specDto.Resolution,
                ScreenType = specDto.ScreenType,
                Weight = specDto.Weight,
                Material = specDto.Material,
                CPUModel = specDto.CPUModel,
                CPUCores = specDto.CPUCores,
                RAM = specDto.RAM,
                InternalStorage = specDto.InternalStorage,
                FrontCamera = specDto.FrontCamera,
                RearCamera = specDto.RearCamera,
                BatteryCapacity = specDto.BatteryCapacity,
                SupportsNFC = specDto.SupportsNFC
            };

            _context.PhoneSpecifications.Add(phoneSpec);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPhoneSpecification), new { id = phoneSpec.Id }, phoneSpec);
        }

        // GET: api/Specifications/PhoneSpecifications/{id}
        [HttpGet("PhoneSpecifications/{id}")]
        public async Task<ActionResult<PhoneSpecification>> GetPhoneSpecification(int id)
        {
            var spec = await _context.PhoneSpecifications.FindAsync(id);
            if (spec == null) return NotFound();
            return spec;
        }

        // POST: api/Specifications/LaptopSpecifications
        [HttpPost("LaptopSpecifications")]
        public async Task<ActionResult<LaptopSpecification>> CreateLaptopSpecification([FromBody] LaptopSpecificationDto specDto)
        {
            var product = await _context.Products.FindAsync(specDto.ProductId);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }

            var laptopSpec = new LaptopSpecification
            {
                ProductId = specDto.ProductId,
                Product = product,
                Weight = specDto.Weight,
                Material = specDto.Material,
                CPUType = specDto.CPUType,
                CPUNumberOfCores = specDto.CPUNumberOfCores,
                RAM = specDto.RAM,
                MaxRAMSupport = specDto.MaxRAMSupport,
                SSDStorage = specDto.SSDStorage,
                ScreenSize = specDto.ScreenSize,
                Resolution = specDto.Resolution,
                RefreshRate = specDto.RefreshRate,
                SupportsTouch = specDto.SupportsTouch
            };

            _context.LaptopSpecifications.Add(laptopSpec);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLaptopSpecification), new { id = laptopSpec.Id }, laptopSpec);
        }

        // GET: api/Specifications/LaptopSpecifications/{id}
        [HttpGet("LaptopSpecifications/{id}")]
        public async Task<ActionResult<LaptopSpecification>> GetLaptopSpecification(int id)
        {
            var spec = await _context.LaptopSpecifications.FindAsync(id);
            if (spec == null) return NotFound();
            return spec;
        }

        // POST: api/Specifications/HeadphoneSpecifications
        [HttpPost("HeadphoneSpecifications")]
        public async Task<ActionResult<HeadphoneSpecification>> CreateHeadphoneSpecification([FromBody] HeadphoneSpecificationDto specDto)
        {
            var product = await _context.Products.FindAsync(specDto.ProductId);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }

            var headphoneSpec = new HeadphoneSpecification
            {
                ProductId = specDto.ProductId,
                Product = product,
                Weight = specDto.Weight,
                Type = specDto.Type,
                ConnectionType = specDto.ConnectionType,
                Port = specDto.Port
            };

            _context.HeadphoneSpecifications.Add(headphoneSpec);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetHeadphoneSpecification), new { id = headphoneSpec.Id }, headphoneSpec);
        }

        // GET: api/Specifications/HeadphoneSpecifications/{id}
        [HttpGet("HeadphoneSpecifications/{id}")]
        public async Task<ActionResult<HeadphoneSpecification>> GetHeadphoneSpecification(int id)
        {
            var spec = await _context.HeadphoneSpecifications.FindAsync(id);
            if (spec == null) return NotFound();
            return spec;
        }
    }
}
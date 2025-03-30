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

        #region Phone Specifications
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
                Product = product,
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

        // PUT: api/Specifications/PhoneSpecifications/{id}
        [HttpPut("PhoneSpecifications/{id}")]
        public async Task<IActionResult> UpdatePhoneSpecification(int id, [FromBody] PhoneSpecificationDto specDto)
        {
            var existingSpec = await _context.PhoneSpecifications.FindAsync(id);
            if (existingSpec == null)
            {
                return NotFound();
            }

            // Cập nhật từng thuộc tính
            existingSpec.ScreenSize = specDto.ScreenSize;
            existingSpec.Resolution = specDto.Resolution;
            existingSpec.ScreenType = specDto.ScreenType;
            existingSpec.Weight = specDto.Weight;
            existingSpec.Material = specDto.Material;
            existingSpec.CPUModel = specDto.CPUModel;
            existingSpec.CPUCores = specDto.CPUCores;
            existingSpec.RAM = specDto.RAM;
            existingSpec.InternalStorage = specDto.InternalStorage;
            existingSpec.FrontCamera = specDto.FrontCamera;
            existingSpec.RearCamera = specDto.RearCamera;
            existingSpec.BatteryCapacity = specDto.BatteryCapacity;
            existingSpec.SupportsNFC = specDto.SupportsNFC;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhoneSpecificationExists(id))
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

        // PATCH: api/Specifications/PhoneSpecifications/{id}
        [HttpPatch("PhoneSpecifications/{id}")]
        public async Task<IActionResult> PartialUpdatePhoneSpecification(int id, [FromBody] Dictionary<string, object> patchDoc)
        {
            var existingSpec = await _context.PhoneSpecifications.FindAsync(id);
            if (existingSpec == null)
            {
                return NotFound();
            }

            foreach (var item in patchDoc)
            {
                var property = typeof(PhoneSpecification).GetProperty(item.Key);
                if (property != null && property.CanWrite)
                {
                    property.SetValue(existingSpec, Convert.ChangeType(item.Value, property.PropertyType));
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PhoneSpecificationExists(id))
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

        // DELETE: api/Specifications/PhoneSpecifications/{id}
        [HttpDelete("PhoneSpecifications/{id}")]
        public async Task<IActionResult> DeletePhoneSpecification(int id)
        {
            var phoneSpec = await _context.PhoneSpecifications.FindAsync(id);
            if (phoneSpec == null)
            {
                return NotFound();
            }

            _context.PhoneSpecifications.Remove(phoneSpec);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private bool PhoneSpecificationExists(int id)
        {
            return _context.PhoneSpecifications.Any(e => e.Id == id);
        }
        #endregion

        #region Laptop Specifications
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

        // PUT: api/Specifications/LaptopSpecifications/{id}
        [HttpPut("LaptopSpecifications/{id}")]
        public async Task<IActionResult> UpdateLaptopSpecification(int id, [FromBody] LaptopSpecificationDto specDto)
        {
            var existingSpec = await _context.LaptopSpecifications.FindAsync(id);
            if (existingSpec == null)
            {
                return NotFound();
            }

            existingSpec.Weight = specDto.Weight;
            existingSpec.Material = specDto.Material;
            existingSpec.CPUType = specDto.CPUType;
            existingSpec.CPUNumberOfCores = specDto.CPUNumberOfCores;
            existingSpec.RAM = specDto.RAM;
            existingSpec.MaxRAMSupport = specDto.MaxRAMSupport;
            existingSpec.SSDStorage = specDto.SSDStorage;
            existingSpec.ScreenSize = specDto.ScreenSize;
            existingSpec.Resolution = specDto.Resolution;
            existingSpec.RefreshRate = specDto.RefreshRate;
            existingSpec.SupportsTouch = specDto.SupportsTouch;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LaptopSpecificationExists(id))
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

        // DELETE: api/Specifications/LaptopSpecifications/{id}
        [HttpDelete("LaptopSpecifications/{id}")]
        public async Task<IActionResult> DeleteLaptopSpecification(int id)
        {
            var laptopSpec = await _context.LaptopSpecifications.FindAsync(id);
            if (laptopSpec == null)
            {
                return NotFound();
            }

            _context.LaptopSpecifications.Remove(laptopSpec);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private bool LaptopSpecificationExists(int id)
        {
            return _context.LaptopSpecifications.Any(e => e.Id == id);
        }
        #endregion

        #region Headphone Specifications
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

        // PUT: api/Specifications/HeadphoneSpecifications/{id}
        [HttpPut("HeadphoneSpecifications/{id}")]
        public async Task<IActionResult> UpdateHeadphoneSpecification(int id, [FromBody] HeadphoneSpecificationDto specDto)
        {
            var existingSpec = await _context.HeadphoneSpecifications.FindAsync(id);
            if (existingSpec == null)
            {
                return NotFound();
            }

            existingSpec.Weight = specDto.Weight;
            existingSpec.Type = specDto.Type;
            existingSpec.ConnectionType = specDto.ConnectionType;
            existingSpec.Port = specDto.Port;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!HeadphoneSpecificationExists(id))
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

        // DELETE: api/Specifications/HeadphoneSpecifications/{id}
        [HttpDelete("HeadphoneSpecifications/{id}")]
        public async Task<IActionResult> DeleteHeadphoneSpecification(int id)
        {
            var headphoneSpec = await _context.HeadphoneSpecifications.FindAsync(id);
            if (headphoneSpec == null)
            {
                return NotFound();
            }

            _context.HeadphoneSpecifications.Remove(headphoneSpec);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool HeadphoneSpecificationExists(int id)
        {
            return _context.HeadphoneSpecifications.Any(e => e.Id == id);
        }
        #endregion

        // GET: api/Specifications/{endpoint}/product/{productId}
        [HttpGet("{endpoint}/product/{productId}")]
        public async Task<ActionResult> GetSpecificationByProduct(string endpoint, int productId)
        {
            switch (endpoint)
            {
                case "PhoneSpecifications":
                    var phoneSpec = await _context.PhoneSpecifications
                        .FirstOrDefaultAsync(s => s.ProductId == productId);
                    if (phoneSpec == null) return NotFound();
                    return Ok(phoneSpec);

                case "LaptopSpecifications":
                    var laptopSpec = await _context.LaptopSpecifications
                        .FirstOrDefaultAsync(s => s.ProductId == productId);
                    if (laptopSpec == null) return NotFound();
                    return Ok(laptopSpec);

                case "HeadphoneSpecifications":
                    var headphoneSpec = await _context.HeadphoneSpecifications
                        .FirstOrDefaultAsync(s => s.ProductId == productId);
                    if (headphoneSpec == null) return NotFound();
                    return Ok(headphoneSpec);

                default:
                    return BadRequest("Loại thông số không hợp lệ");
            }
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;

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

        // GET: api/Specifications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductSpecificationDto>>> GetAllSpecifications()
        {
            var specifications = await _context.ProductSpecifications
                .OrderBy(s => s.ProductId)
                .ThenBy(s => s.DisplayOrder)
                .ThenBy(s => s.Name)
                .Select(s => new ProductSpecificationDto
                {
                    Id = s.Id,
                    ProductId = s.ProductId,
                    Name = s.Name,
                    Value = s.Value,
                    Unit = s.Unit,
                    DisplayOrder = s.DisplayOrder,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            return Ok(specifications);
        }

        // GET: api/Specifications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductSpecificationDto>> GetSpecification(int id)
        {
            var specification = await _context.ProductSpecifications
                .Where(s => s.Id == id)
                .Select(s => new ProductSpecificationDto
                {
                    Id = s.Id,
                    ProductId = s.ProductId,
                    Name = s.Name,
                    Value = s.Value,
                    Unit = s.Unit,
                    DisplayOrder = s.DisplayOrder,
                    CreatedAt = s.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (specification == null)
            {
                return NotFound("Thông số kỹ thuật không tồn tại.");
            }

            return Ok(specification);
        }

        // GET: api/Specifications/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<ProductSpecificationDto>>> GetSpecificationsByProduct(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }

            var specifications = await _context.ProductSpecifications
                .Where(s => s.ProductId == productId)
                .OrderBy(s => s.DisplayOrder)
                .ThenBy(s => s.Name)
                .Select(s => new ProductSpecificationDto
                {
                    Id = s.Id,
                    ProductId = s.ProductId,
                    Name = s.Name,
                    Value = s.Value,
                    Unit = s.Unit,
                    DisplayOrder = s.DisplayOrder,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            return Ok(specifications);
        }

        // POST: api/Specifications
        [HttpPost]
        public async Task<ActionResult<ProductSpecificationDto>> CreateSpecification([FromBody] CreateProductSpecificationDto createDto)
        {
            var product = await _context.Products.FindAsync(createDto.ProductId);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }

            var specification = new ProductSpecification
            {
                ProductId = createDto.ProductId,
                Name = createDto.Name,
                Value = createDto.Value,
                Unit = createDto.Unit,
                DisplayOrder = createDto.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.ProductSpecifications.Add(specification);
            await _context.SaveChangesAsync();

            var result = new ProductSpecificationDto
            {
                Id = specification.Id,
                ProductId = specification.ProductId,
                Name = specification.Name,
                Value = specification.Value,
                Unit = specification.Unit,
                DisplayOrder = specification.DisplayOrder,
                CreatedAt = specification.CreatedAt
            };

            return CreatedAtAction(nameof(GetSpecification), new { id = specification.Id }, result);
        }

        // PUT: api/Specifications/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSpecification(int id, [FromBody] UpdateProductSpecificationDto updateDto)
        {
            var specification = await _context.ProductSpecifications.FindAsync(id);
            if (specification == null)
            {
                return NotFound("Thông số kỹ thuật không tồn tại.");
            }

            specification.Name = updateDto.Name;
            specification.Value = updateDto.Value;
            specification.Unit = updateDto.Unit;
            specification.DisplayOrder = updateDto.DisplayOrder;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SpecificationExists(id))
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

        // DELETE: api/Specifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSpecification(int id)
        {
            var specification = await _context.ProductSpecifications.FindAsync(id);
            if (specification == null)
            {
                return NotFound("Thông số kỹ thuật không tồn tại.");
            }

            _context.ProductSpecifications.Remove(specification);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Specifications/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult> CreateBulkSpecifications([FromBody] IEnumerable<CreateProductSpecificationDto> specifications)
        {
            var productIds = specifications.Select(s => s.ProductId).Distinct().ToList();
            var existingProducts = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync();

            var invalidProductIds = productIds.Except(existingProducts).ToList();
            if (invalidProductIds.Any())
            {
                return BadRequest($"Các sản phẩm không tồn tại: {string.Join(", ", invalidProductIds)}");
            }

            var specificationEntities = specifications.Select(s => new ProductSpecification
            {
                ProductId = s.ProductId,
                Name = s.Name,
                Value = s.Value,
                Unit = s.Unit,
                DisplayOrder = s.DisplayOrder,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.ProductSpecifications.AddRange(specificationEntities);
            await _context.SaveChangesAsync();

            return Ok($"Đã tạo {specificationEntities.Count} thông số kỹ thuật.");
        }

        // DELETE: api/Specifications/product/{productId}
        [HttpDelete("product/{productId}")]
        public async Task<IActionResult> DeleteSpecificationsByProduct(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
            {
                return NotFound("Sản phẩm không tồn tại.");
            }

            var specifications = await _context.ProductSpecifications
                .Where(s => s.ProductId == productId)
                .ToListAsync();

            if (specifications.Any())
            {
                _context.ProductSpecifications.RemoveRange(specifications);
                await _context.SaveChangesAsync();
            }

            return Ok($"Đã xóa {specifications.Count} thông số kỹ thuật của sản phẩm {productId}.");
        }

        private bool SpecificationExists(int id)
        {
            return _context.ProductSpecifications.Any(e => e.Id == id);
        }
    }
}
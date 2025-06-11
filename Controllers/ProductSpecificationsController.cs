using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;

namespace SHN_Gear.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductSpecificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductSpecificationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ProductSpecifications/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<ProductSpecificationDto>>> GetProductSpecifications(int productId)
        {
            var specifications = await _context.ProductSpecifications
                .Where(ps => ps.ProductId == productId)
                .OrderBy(ps => ps.DisplayOrder)
                .ThenBy(ps => ps.Name)
                .Select(ps => new ProductSpecificationDto
                {
                    Id = ps.Id,
                    ProductId = ps.ProductId,
                    Name = ps.Name,
                    Value = ps.Value,
                    Unit = ps.Unit,
                    DisplayOrder = ps.DisplayOrder
                })
                .ToListAsync();

            return Ok(specifications);
        }

        // GET: api/ProductSpecifications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductSpecificationDto>> GetProductSpecification(int id)
        {
            var specification = await _context.ProductSpecifications.FindAsync(id);

            if (specification == null)
            {
                return NotFound();
            }

            var dto = new ProductSpecificationDto
            {
                Id = specification.Id,
                ProductId = specification.ProductId,
                Name = specification.Name,
                Value = specification.Value,
                Unit = specification.Unit,
                DisplayOrder = specification.DisplayOrder
            };

            return Ok(dto);
        }

        // POST: api/ProductSpecifications
        [HttpPost]
        public async Task<ActionResult<ProductSpecificationDto>> CreateProductSpecification(CreateProductSpecificationDto dto)
        {
            // Kiểm tra xem product có tồn tại không
            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!productExists)
            {
                return BadRequest("Product not found");
            }

            // Kiểm tra xem đã có specification với tên này cho product chưa
            var existingSpec = await _context.ProductSpecifications
                .FirstOrDefaultAsync(ps => ps.ProductId == dto.ProductId && ps.Name == dto.Name);

            if (existingSpec != null)
            {
                return BadRequest($"Specification '{dto.Name}' already exists for this product");
            }

            var specification = new ProductSpecification
            {
                ProductId = dto.ProductId,
                Name = dto.Name,
                Value = dto.Value,
                Unit = dto.Unit,
                DisplayOrder = dto.DisplayOrder
            };

            _context.ProductSpecifications.Add(specification);
            await _context.SaveChangesAsync();

            var resultDto = new ProductSpecificationDto
            {
                Id = specification.Id,
                ProductId = specification.ProductId,
                Name = specification.Name,
                Value = specification.Value,
                Unit = specification.Unit,
                DisplayOrder = specification.DisplayOrder
            };

            return CreatedAtAction(nameof(GetProductSpecification), new { id = specification.Id }, resultDto);
        }

        // PUT: api/ProductSpecifications/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProductSpecification(int id, UpdateProductSpecificationDto dto)
        {
            var specification = await _context.ProductSpecifications.FindAsync(id);
            if (specification == null)
            {
                return NotFound();
            }

            // Kiểm tra xem có specification khác với tên này cho cùng product không
            var existingSpec = await _context.ProductSpecifications
                .FirstOrDefaultAsync(ps => ps.ProductId == specification.ProductId &&
                                          ps.Name == dto.Name && ps.Id != id);

            if (existingSpec != null)
            {
                return BadRequest($"Specification '{dto.Name}' already exists for this product");
            }

            specification.Name = dto.Name;
            specification.Value = dto.Value;
            specification.Unit = dto.Unit;
            specification.DisplayOrder = dto.DisplayOrder;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductSpecificationExists(id))
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

        // DELETE: api/ProductSpecifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductSpecification(int id)
        {
            var specification = await _context.ProductSpecifications.FindAsync(id);
            if (specification == null)
            {
                return NotFound();
            }

            _context.ProductSpecifications.Remove(specification);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/ProductSpecifications/batch
        [HttpPost("batch")]
        public async Task<ActionResult> CreateBatchProductSpecifications(List<CreateProductSpecificationDto> dtos)
        {
            if (dtos == null || !dtos.Any())
            {
                return BadRequest("No specifications provided");
            }

            var productId = dtos.First().ProductId;

            // Kiểm tra xem tất cả specifications đều cho cùng một product
            if (dtos.Any(dto => dto.ProductId != productId))
            {
                return BadRequest("All specifications must be for the same product");
            }

            // Kiểm tra xem product có tồn tại không
            var productExists = await _context.Products.AnyAsync(p => p.Id == productId);
            if (!productExists)
            {
                return BadRequest("Product not found");
            }

            var specifications = new List<ProductSpecification>();

            foreach (var dto in dtos)
            {
                // Kiểm tra trùng lặp trong batch
                if (specifications.Any(s => s.Name == dto.Name))
                {
                    return BadRequest($"Duplicate specification name '{dto.Name}' in batch");
                }

                specifications.Add(new ProductSpecification
                {
                    ProductId = dto.ProductId,
                    Name = dto.Name,
                    Value = dto.Value,
                    Unit = dto.Unit,
                    DisplayOrder = dto.DisplayOrder
                });
            }

            _context.ProductSpecifications.AddRange(specifications);
            await _context.SaveChangesAsync();

            return Ok($"Created {specifications.Count} specifications successfully");
        }

        private bool ProductSpecificationExists(int id)
        {
            return _context.ProductSpecifications.Any(e => e.Id == id);
        }
    }
}

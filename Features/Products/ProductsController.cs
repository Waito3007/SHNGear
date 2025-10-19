using Microsoft.AspNetCore.Mvc;
using SHN_Gear.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SHN_Gear.Features.Products
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResponseDto<ProductDto>>> GetProducts(
            [FromQuery] int? categoryId = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 6,
            [FromQuery] string sortBy = "name",
            [FromQuery] string sortOrder = "asc",
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int? brandId = null)
        {
            var products = await _productService.GetProducts(categoryId, page, pageSize, sortBy, sortOrder, minPrice, maxPrice, brandId);
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _productService.GetProduct(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> PostProduct([FromBody] ProductDto productDto)
        {
            var createdProduct = await _productService.CreateProduct(productDto);
            return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.Id }, createdProduct);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, [FromBody] ProductDto productDto)
        {
            var result = await _productService.UpdateProduct(id, productDto);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var result = await _productService.DeleteProduct(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("related-by-brand/{brandId}/{currentProductId}")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetRelatedProductsByBrand(int brandId, int currentProductId)
        {
            var products = await _productService.GetRelatedProductsByBrand(brandId, currentProductId);
            return Ok(products);
        }

        [HttpGet("{id}/variants")]
        public async Task<ActionResult<IEnumerable<object>>> GetProductVariants(int id)
        {
            var variants = await _productService.GetProductVariants(id);
            if (variants == null)
            {
                return NotFound();
            }
            return Ok(variants);
        }

        [HttpGet("count")]
        public async Task<ActionResult<int>> GetProductCount()
        {
            var count = await _productService.GetProductCount();
            return Ok(count);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string keyword)
        {
            var products = await _productService.SearchProducts(keyword);
            return Ok(products);
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<int>> GetLowStockProducts()
        {
            var count = await _productService.GetLowStockProducts();
            return Ok(count);
        }

        [HttpGet("by-category")]
        public async Task<ActionResult> GetProductCountByCategory()
        {
            var result = await _productService.GetProductCountByCategory();
            return Ok(result);
        }

        [HttpGet("by-brand")]
        public async Task<ActionResult> GetProductCountByBrand()
        {
            var result = await _productService.GetProductCountByBrand();
            return Ok(result);
        }

        [HttpGet("lowest-price")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsWithLowestPrice()
        {
            var products = await _productService.GetProductsWithLowestPrice();
            return Ok(products);
        }

        [HttpGet("by-variant/{variantId}")]
        public async Task<ActionResult<object>> GetProductByVariantId(int variantId)
        {
            var result = await _productService.GetProductByVariantId(variantId);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost("compare")]
        public async Task<ActionResult<IEnumerable<CompareResultDto>>> CompareProducts([FromBody] List<int> productIds)
        {
            var result = await _productService.CompareProducts(productIds);
            return Ok(result);
        }

        [HttpGet("by-ids")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByIds([FromQuery] string ids)
        {
            var products = await _productService.GetProductsByIds(ids);
            return Ok(products);
        }

        [HttpGet("flash-sale")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFlashSaleProducts()
        {
            var products = await _productService.GetFlashSaleProducts();
            return Ok(products);
        }

        [HttpPut("{id}/set-flash-sale")]
        public async Task<IActionResult> SetFlashSale(int id, [FromBody] FlashSaleUpdateDto flashSaleDto)
        {
            var result = await _productService.SetFlashSale(id, flashSaleDto);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpPut("{id}/clear-flash-sale")]
        public async Task<IActionResult> ClearFlashSale(int id)
        {
            var result = await _productService.ClearFlashSale(id);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("pinned")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetPinnedProducts()
        {
            var products = await _productService.GetPinnedProducts();
            return Ok(products);
        }

        [HttpPut("{id}/pin")]
        public async Task<IActionResult> TogglePin(int id, [FromBody] PinnedProductDto pinnedProductDto)
        {
            var result = await _productService.TogglePin(id, pinnedProductDto);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}

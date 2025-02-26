using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.DTOs;
using SHN_Gear.Models;
using System.Text.RegularExpressions;
using System.Linq;
using System.Threading.Tasks;

namespace SHN_Gear.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public ProductController(AppDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Ảnh không hợp lệ");

            using (var stream = file.OpenReadStream())
            {
                var imageUrl = await _cloudinaryService.UploadImageAsync(stream, file.FileName);
                return Ok(new { ImageUrl = imageUrl });
            }
        }

        // 🟢 Thêm sản phẩm mới
        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] ProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                DiscountPrice = dto.DiscountPrice,
                FlashSaleStart = dto.FlashSaleStart,
                FlashSaleEnd = dto.FlashSaleEnd,
                Category = dto.Category,
                CreatedAt = DateTime.UtcNow,
                StockQuantity = dto.StockQuantity,
                Variants = dto.Variants.Select(v => new ProductVariant
                {
                    Color = v.Color,
                    Storage = v.Storage,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity
                }).ToList()
            };

            if (dto.ImageUrls != null && dto.ImageUrls.Any())
            {
                product.Images = dto.ImageUrls.Select(url => new ProductImage
                {
                    ImageUrl = url,
                    IsPrimary = false // Hoặc bạn có thể thêm logic để xác định ảnh chính
                }).ToList();
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sản phẩm đã được thêm.", ProductId = product.Id });
        }

        // 🔵 Lấy danh sách sản phẩm
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _context.Products
                .Include(p => p.Images)
                .ToListAsync();

            return Ok(products);
        }

        // 🔵 Lấy chi tiết một sản phẩm
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            return Ok(product);
        }

        // 🟡 Cập nhật sản phẩm
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductDto dto)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.DiscountPrice = dto.DiscountPrice;
            product.FlashSaleStart = dto.FlashSaleStart;
            product.FlashSaleEnd = dto.FlashSaleEnd;
            product.Category = dto.Category;
            product.StockQuantity = dto.StockQuantity;

            // Cập nhật ảnh sản phẩm
            if (dto.ImageUrls != null && dto.ImageUrls.Any())
            {
                // Xóa ảnh cũ không có trong danh sách mới
                var existingImageUrls = product.Images.Select(img => img.ImageUrl).ToList();
                var newImageUrls = dto.ImageUrls.Except(existingImageUrls).ToList();
                var removedImageUrls = existingImageUrls.Except(dto.ImageUrls).ToList();

                foreach (var url in removedImageUrls)
                {
                    var image = product.Images.FirstOrDefault(img => img.ImageUrl == url);
                    if (image != null)
                    {
                        _context.ProductImages.Remove(image);
                        // Xóa ảnh từ Cloudinary
                        var publicId = GetPublicIdFromUrl(url);
                        if (publicId != null)
                        {
                            await _cloudinaryService.DeleteImageAsync(publicId);
                        }
                    }
                }

                // Thêm ảnh mới
                foreach (var url in newImageUrls)
                {
                    product.Images.Add(new ProductImage
                    {
                        ImageUrl = url,
                        IsPrimary = false // Hoặc bạn có thể thêm logic để xác định ảnh chính
                    });
                }
            }

            // Cập nhật biến thể sản phẩm
            product.Variants.Clear();
            product.Variants = dto.Variants.Select(v => new ProductVariant
            {
                Color = v.Color,
                Storage = v.Storage,
                Price = v.Price,
                StockQuantity = v.StockQuantity
            }).ToList();

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sản phẩm đã được cập nhật." });
        }

        // Hàm lấy publicId từ URL của Cloudinary
        private string GetPublicIdFromUrl(string url)
        {
            var matches = Regex.Match(url, @"\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)");
            return matches.Success ? matches.Groups[1].Value : null;
        }

        // 🔴 Xóa sản phẩm và tất cả thông tin liên quan (thông số kỹ thuật & ảnh sản phẩm)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Sản phẩm không tồn tại.");

            // Xóa tất cả thông số kỹ thuật liên quan
            var phoneSpec = await _context.PhoneSpecifications.FirstOrDefaultAsync(p => p.ProductId == id);
            if (phoneSpec != null) _context.PhoneSpecifications.Remove(phoneSpec);

            var laptopSpec = await _context.LaptopSpecifications.FirstOrDefaultAsync(l => l.ProductId == id);
            if (laptopSpec != null) _context.LaptopSpecifications.Remove(laptopSpec);

            var headphoneSpec = await _context.HeadphoneSpecifications.FirstOrDefaultAsync(h => h.ProductId == id);
            if (headphoneSpec != null) _context.HeadphoneSpecifications.Remove(headphoneSpec);

            // Xóa ảnh sản phẩm liên quan
            _context.ProductImages.RemoveRange(product.Images);
            _context.ProductVariants.RemoveRange(product.Variants);

            // Xóa sản phẩm
            _context.Products.Remove(product);

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sản phẩm và tất cả dữ liệu liên quan đã được xóa." });
        }
    }
}

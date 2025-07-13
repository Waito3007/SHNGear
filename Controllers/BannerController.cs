using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;

[Route("api/[controller]")]
[ApiController]
public class BannerController : ControllerBase
{
    private readonly AppDbContext _context;
    public BannerController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<IActionResult> GetBanners()
    {
        var banners = await _context.Banners
            .Include(s => s.Images)
            .ToListAsync();
        return Ok(banners);
    }

    [HttpPost]
    public async Task<ActionResult<Banner>> AddBanner([FromBody] BannerDto bannerDto)
    {
        if (bannerDto == null)
            return BadRequest("Dữ liệu Slider không hợp lệ.");
        var banner = new Banner
        {
            Title = bannerDto.Title,
            Status = bannerDto.Status == false ? false : true,
            Images = bannerDto.Images?.Select(img => new BannerImage
            {
                ImageUrl = img.ImageUrl,
            }).ToList() ?? new List<BannerImage>(),
        };

        _context.Banners.Add(banner);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBanners), new { id = banner.Id }, banner);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBanner(int id, [FromBody] BannerDto bannerDto)
    {
        if (bannerDto == null || id <= 0)
            return BadRequest("Dữ liệu Banner không hợp lệ.");

        var existingBanner = await _context.Banners
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existingBanner == null)
            return NotFound("Banner không tồn tại.");

        existingBanner.Title = bannerDto.Title;
        existingBanner.Status = bannerDto.Status;
        existingBanner.Images = bannerDto.Images?.Select(img => new BannerImage
        {
            ImageUrl = img.ImageUrl
        }).ToList() ?? new List<BannerImage>();

        _context.Banners.Update(existingBanner);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBanner(int id)
    {
        var banner = await _context.Banners
        .Include(p => p.Images)
        .FirstOrDefaultAsync(p => p.Id == id);

        if (banner == null)
        {
            return NotFound();
        }

        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
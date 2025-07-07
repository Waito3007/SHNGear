using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;

[Route("api/[controller]")]
[ApiController]
public class SliderController : ControllerBase
{
    private readonly AppDbContext _context;
    public SliderController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet]
    public async Task<IActionResult> GetSliders()
    {
        var sliders = await _context.Sliders
            .Include(s => s.Images)
            .ToListAsync();
        return Ok(sliders);
    }

    [HttpPost]
    public async Task<ActionResult<Slider>> AddSlider([FromBody] SliderDto sliderDto)
    {
        if (sliderDto == null)
            return BadRequest("Dữ liệu Slider không hợp lệ.");
        var slider = new Slider
        {
            Title = sliderDto.Title,
            Status = sliderDto.Status == false ? false : true,
            LinkToProduct = sliderDto.LinkToProduct,
            Images = sliderDto.Images?.Select(img => new SliderImage
            {
                ImageUrl = img.ImageUrl,
            }).ToList() ?? new List<SliderImage>(),
        };

        _context.Sliders.Add(slider);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetSliders), new { id = slider.Id }, slider);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSlider(int id, [FromBody] Slider sliderDto)
    {
        if (sliderDto == null || id < 0)
            return BadRequest("Dữ liệu Slider không hợp lệ.");

        var existingSlider = await _context.Sliders
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (existingSlider == null)
            return NotFound("Slider không tồn tại.");

        existingSlider.Title = sliderDto.Title;
        existingSlider.Status = sliderDto.Status;
        existingSlider.LinkToProduct = sliderDto.LinkToProduct;

        existingSlider.Images = sliderDto.Images?.Select(img => new SliderImage
        {
            ImageUrl = img.ImageUrl
        }).ToList() ?? new List<SliderImage>();

        _context.Sliders.Update(existingSlider);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSlider(int id)
    {
        var slider = await _context.Sliders
        .Include(p => p.Images)
        .FirstOrDefaultAsync(p => p.Id == id);

        if (slider == null)
        {
            return NotFound();
        }

        _context.Sliders.Remove(slider);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
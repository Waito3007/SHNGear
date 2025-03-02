using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.IO;
using SHN_Gear.Data;
using SHN_Gear.Models;
using SHN_Gear.DTOs;
[Route("api/upload")]
[ApiController]
public class UploadController : ControllerBase
{
    private readonly CloudinaryService _cloudinaryService;

    public UploadController(CloudinaryService cloudinaryService)
    {
        _cloudinaryService = cloudinaryService;
    }

    // 📌 API Upload Ảnh Chung
    [HttpPost]
    public async Task<IActionResult> UploadImage([FromQuery] string type)
    {
        if (Request.Form.Files.Count == 0)
        {
            return BadRequest("Không có file nào được gửi lên.");
        }

        var file = Request.Form.Files[0];
        using var stream = file.OpenReadStream();
        var imageUrl = await _cloudinaryService.UploadImageAsync(stream, file.FileName);

        return Ok(new { type, url = imageUrl });
    }
}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

[Route("api/upload")]
[ApiController]
public class UploadController : ControllerBase
{
    private readonly string _uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");


    [HttpPost]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Không có file nào được tải lên!" });
        }

        string uniqueFileName = $"{DateTime.Now.Ticks}_{file.FileName}";
        string filePath = Path.Combine(_uploadFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        string imageUrl = $"/{uniqueFileName}";
        return Ok(new { imageUrl });
    }
    /// <summary>
    /// Lấy danh sách tất cả ảnh đã tải lên
    /// </summary>
    [HttpGet]
    public IActionResult GetAllImages()
    {
        if (!Directory.Exists(_uploadFolder))
        {
            return NotFound(new { message = "Thư mục ảnh trống!" });
        }

        var files = Directory.GetFiles(_uploadFolder)
            .Select(Path.GetFileName)
.Select(fileName => new { imageUrl = $"/{fileName}" })
            .ToList();

        return Ok(files);
    }

    /// Xóa ảnh theo tên file
    [HttpDelete("{fileName}")]
    public IActionResult DeleteImage(string fileName)
    {
        string filePath = Path.Combine(_uploadFolder, fileName);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = "Ảnh không tồn tại!" });
        }

        System.IO.File.Delete(filePath);
        return Ok(new { message = "Ảnh đã được xóa!" });
    }
    [HttpGet("get-image/{fileName}")]
    public IActionResult GetImage(string fileName)
    {
        var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", fileName);
        if (!System.IO.File.Exists(imagePath))
        {
            return NotFound();
        }
        return PhysicalFile(imagePath, "image/png");
    }
}
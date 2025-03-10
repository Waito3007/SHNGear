using Microsoft.AspNetCore.Authorization; // Thêm xác thực
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using SHN_Gear.DTOs;

[Route("api/upload")]
[ApiController]
public class UploadController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ILogger<UploadController> _logger;
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB

    public UploadController(ICloudinaryService cloudinaryService, ILogger<UploadController> logger)
    {
        _cloudinaryService = cloudinaryService ?? throw new ArgumentNullException(nameof(cloudinaryService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        var response = new UploadResponseDto();

        try
        {
            // Validation
            if (!ValidateFile(file, response))
            {
                return BadRequest(response);
            }

            _logger.LogInformation("Starting image upload: {FileName}", file.FileName);
            string imageUrl = await _cloudinaryService.UploadImageAsync(file);

            response.Success = true;
            response.Message = "Image uploaded successfully";
            response.Url = imageUrl;
            response.PublicId = ExtractPublicIdFromUrl(imageUrl); // Hàm helper để lấy publicId

            _logger.LogInformation("Image uploaded successfully: {Url}", imageUrl);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image: {FileName}", file?.FileName);
            response.Success = false;
            response.Message = "An error occurred while uploading the image";
            return StatusCode(500, response);
        }
    }

    [HttpDelete("delete-image")]
    public async Task<IActionResult> DeleteImage([FromQuery] string publicId)
    {
        var response = new UploadResponseDto();

        try
        {
            if (string.IsNullOrWhiteSpace(publicId))
            {
                response.Success = false;
                response.Message = "PublicId is required";
                return BadRequest(response);
            }

            _logger.LogInformation("Starting image deletion: {PublicId}", publicId);
            await _cloudinaryService.DeleteImageAsync(publicId);

            response.Success = true;
            response.Message = "Image deleted successfully";
            response.PublicId = publicId;

            _logger.LogInformation("Image deleted successfully: {PublicId}", publicId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image: {PublicId}", publicId);
            response.Success = false;
            response.Message = "An error occurred while deleting the image";
            return StatusCode(500, response);
        }
    }

    // Helper method để validate file
    private bool ValidateFile(IFormFile file, UploadResponseDto response)
    {
        if (file == null || file.Length == 0)
        {
            response.Message = "No file uploaded";
            return false;
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            response.Message = $"Invalid file type. Only {string.Join(", ", AllowedExtensions)} are allowed";
            return false;
        }

        if (file.Length > MaxFileSize)
        {
            response.Message = $"File size exceeds {MaxFileSize / (1024 * 1024)}MB limit";
            return false;
        }

        return true;
    }

    // Helper method để lấy publicId từ URL (tùy thuộc vào cấu trúc URL của Cloudinary)
    private string ExtractPublicIdFromUrl(string url)
    {
        if (string.IsNullOrEmpty(url)) return null;
        var uri = new Uri(url);
        var segments = uri.Segments;
        var lastSegment = segments.LastOrDefault()?.Split('.').FirstOrDefault();
        return lastSegment;
    }
}
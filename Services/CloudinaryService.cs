using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System;
using System.IO;
using System.Threading.Tasks;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(Cloudinary cloudinary)
    {
        _cloudinary = cloudinary;
    }

    // 📌 Upload ảnh lên Cloudinary
    public async Task<string> UploadImageAsync(Stream stream, string fileName)
    {
        var uploadParams = new ImageUploadParams()
        {
            File = new FileDescription(fileName, stream),
            PublicId = $"products/{Guid.NewGuid()}",  // Tạo ID duy nhất
            Overwrite = false
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        return uploadResult.SecureUrl.AbsoluteUri;
    }

    // 📌 Xóa ảnh khỏi Cloudinary
    public async Task DeleteImageAsync(string imageUrl)
    {
        // Trích xuất `public_id` từ URL
        string publicId = ExtractPublicId(imageUrl);
        if (string.IsNullOrEmpty(publicId))
        {
            throw new ArgumentException("Không thể lấy public ID từ URL ảnh.");
        }

        var deletionParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deletionParams);
    }

    // 🔥 Hàm hỗ trợ trích xuất `public_id` từ URL ảnh Cloudinary
    private string ExtractPublicId(string imageUrl)
    {
        try
        {
            Uri uri = new Uri(imageUrl);
            string path = uri.AbsolutePath;

            // Định dạng URL của Cloudinary: `/v<version>/cloud_name/image/upload/<public_id>.<format>`
            var parts = path.Split('/');
            if (parts.Length > 4)
            {
                string fileName = parts[^1];  // Lấy phần cuối (vd: abcxyz.jpg)
                int lastDotIndex = fileName.LastIndexOf('.');
                if (lastDotIndex > 0)
                {
                    return string.Join("/", parts[3..^1]) + "/" + fileName[..lastDotIndex];
                }
            }
        }
        catch { }

        return null; // Trả về null nếu không tìm thấy public_id
    }
}

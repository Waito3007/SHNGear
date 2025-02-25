using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
namespace SHN_Gear.Services
{
public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task<bool> SendOTPAsync(string recipientEmail)
    {
        try
        {
            var emailSettings = _config.GetSection("EmailSettings");
            string otpCode = GenerateOTP();

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("SHN Gear", emailSettings["SenderEmail"]));
            message.To.Add(new MailboxAddress("", recipientEmail));
            message.Subject = "Mã OTP của bạn";
            message.Body = new TextPart("plain") { Text = $"Mã OTP của bạn là: {otpCode}" };

            using var client = new SmtpClient();
            await client.ConnectAsync(emailSettings["SMTPHost"], int.Parse(emailSettings["SMTPPort"]), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(emailSettings["SenderEmail"], emailSettings["SenderPassword"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi gửi email: {ex.Message}");
            return false;
        }
    }

    private string GenerateOTP()
    {
        using var rng = new RNGCryptoServiceProvider();
        var data = new byte[4];
        rng.GetBytes(data);
        int otp = BitConverter.ToUInt16(data, 0) % 1000000;
        return otp.ToString("D6");
    }
}
}
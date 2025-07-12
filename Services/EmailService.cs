using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using SHN_Gear.Configuration;

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
                // Sử dụng environment variables hoặc fallback về appsettings
                string smtpHost = EnvironmentConfig.Email.SmtpHost ?? _config["EmailSettings:SMTPHost"] ?? "smtp.gmail.com";
                int smtpPort = EnvironmentConfig.Email.SmtpPort > 0 ? EnvironmentConfig.Email.SmtpPort : int.Parse(_config["EmailSettings:SMTPPort"] ?? "587");
                string senderEmail = EnvironmentConfig.Email.SenderEmail ?? _config["EmailSettings:SenderEmail"] ?? throw new InvalidOperationException("Sender email not configured");
                string senderPassword = EnvironmentConfig.Email.SenderPassword ?? _config["EmailSettings:SenderPassword"] ?? throw new InvalidOperationException("Sender password not configured");

                string otpCode = GenerateOTP();

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("SHN Gear", senderEmail));
                message.To.Add(new MailboxAddress("", recipientEmail));
                message.Subject = "Mã OTP của bạn";
                message.Body = new TextPart("plain") { Text = $"Mã OTP của bạn là: {otpCode}" };

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, senderPassword);
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

        public async Task SendOrderConfirmationEmailAsync(Models.User user, Models.Order order)
        {
            try
            {
                // Sử dụng environment variables hoặc fallback về appsettings
                string smtpHost = EnvironmentConfig.Email.SmtpHost ?? _config["EmailSettings:SMTPHost"] ?? "smtp.gmail.com";
                int smtpPort = EnvironmentConfig.Email.SmtpPort > 0 ? EnvironmentConfig.Email.SmtpPort : int.Parse(_config["EmailSettings:SMTPPort"] ?? "587");
                string senderEmail = EnvironmentConfig.Email.SenderEmail ?? _config["EmailSettings:SenderEmail"] ?? throw new InvalidOperationException("Sender email not configured");
                string senderPassword = EnvironmentConfig.Email.SenderPassword ?? _config["EmailSettings:SenderPassword"] ?? throw new InvalidOperationException("Sender password not configured");

                var subject = $"Xác nhận đơn hàng #{order.Id} từ SHN Gear";
                var toAddress = new MailboxAddress(user.FullName, user.Email);

                var bodyBuilder = new BodyBuilder();
                bodyBuilder.HtmlBody = GenerateOrderConfirmationHtml(user, order);

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("SHN Gear", senderEmail));
                message.To.Add(toAddress);
                message.Subject = subject;
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, senderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                Console.WriteLine($"Email xác nhận đơn hàng #{order.Id} đã được gửi thành công tới {user.Email}");
            }
            catch (Exception ex)
            {
                // Log the exception (using a logging framework is recommended)
                Console.WriteLine($"Lỗi gửi email xác nhận đơn hàng #{order.Id}: {ex.Message}");
                Console.WriteLine($"Chi tiết lỗi: {ex.StackTrace}");
                // Optionally re-throw or handle the error as needed
            }
        }

        private string GenerateOrderConfirmationHtml(Models.User user, Models.Order order)
        {
            var itemsHtml = new StringBuilder();
            foreach (var item in order.OrderItems)
            {
                itemsHtml.Append($@"
                <tr>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee;"">{item.ProductVariant.Product.Name} ({item.ProductVariant.Color}, {item.ProductVariant.Storage})</td>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: center;"">{item.Quantity}</td>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{item.Price:N0} VNĐ</td>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{(item.Quantity * item.Price):N0} VNĐ</td>
                </tr>");
            }

            var html = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }}
        .container {{ max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }}
        .header {{ background-color: #00466a; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; }}
        .footer {{ margin-top: 20px; text-align: center; font-size: 0.8em; color: #888; }}
        .button {{ background-color: #00466a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>Cảm ơn bạn đã mua hàng tại SHN Gear!</h2>
        </div>
        <div style=""padding: 20px;"">
            <p>Chào {user.FullName},</p>
            <p>Chúng tôi đã nhận được đơn hàng của bạn. Dưới đây là chi tiết đơn hàng:</p>
            <p><strong>Mã đơn hàng:</strong> #{order.Id}</p>
            <p><strong>Ngày đặt:</strong> {order.OrderDate:dd/MM/yyyy HH:mm}</p>
            <p><strong>Trạng thái:</strong> {order.OrderStatus}</p>
            <hr>
            <h3>Chi tiết sản phẩm</h3>
            <table style=""width: 100%; border-collapse: collapse;"">
                <thead>
                    <tr>
                        <th style=""padding: 10px; border-bottom: 2px solid #ddd; text-align: left;"">Sản phẩm</th>
                        <th style=""padding: 10px; border-bottom: 2px solid #ddd; text-align: center;"">Số lượng</th>
                        <th style=""padding: 10px; border-bottom: 2px solid #ddd; text-align: right;"">Đơn giá</th>
                        <th style=""padding: 10px; border-bottom: 2px solid #ddd; text-align: right;"">Tổng</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                </tbody>
            </table>
            <h3 style=""text-align: right; margin-top: 20px;"">Tổng cộng: <span style=""color: #d9534f;"">{order.TotalAmount:N0} VNĐ</span></h3>
            <hr>
            <h3>Thông tin giao hàng</h3>
            <p>
                <strong>Người nhận:</strong> {order.Address?.FullName ?? "N/A"}<br>
                <strong>Địa chỉ:</strong> {order.Address?.AddressLine1 ?? "N/A"}, {order.Address?.City ?? "N/A"}<br>
                <strong>Điện thoại:</strong> {order.Address?.PhoneNumber ?? "N/A"}
            </p>
            <div style=""text-align: center; margin-top: 30px;"">
                <a href=""{_config["WebAppBaseUrl"]}/profile/orders"" class=""button"">Xem đơn hàng của bạn</a>
            </div>
        </div>
        <div class=""footer"">
            <p>SHN Gear &copy; {DateTime.Now.Year}</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
        </div>
    </div>
</body>
</html>";
            return html;
        }
    }
}
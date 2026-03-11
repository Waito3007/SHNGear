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
            decimal subtotal = 0;

            foreach (var item in order.OrderItems)
            {
                decimal itemTotal = item.Quantity * item.Price;
                subtotal += itemTotal;

                itemsHtml.Append($@"
                <tr>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee;"">{item.ProductVariant.Product.Name} ({item.ProductVariant.Color}, {item.ProductVariant.Storage})</td>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: center;"">{item.Quantity}</td>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{item.Price:N0} VNĐ</td>
                    <td style=""padding: 10px; border-bottom: 1px solid #eee; text-align: right;"">{itemTotal:N0} VNĐ</td>
                </tr>");
            }

            // Tính toán voucher discount và final amount
            decimal voucherDiscount = 0;
            string voucherInfo = "";

            if (order.VoucherId.HasValue && order.Voucher != null)
            {
                voucherDiscount = order.Voucher.DiscountAmount;
                voucherInfo = $@"
                <tr>
                    <td colspan=""3"" style=""padding: 10px; text-align: right; font-weight: bold; color: #28a745;"">Voucher giảm giá:</td>
                    <td style=""padding: 10px; text-align: right; font-weight: bold; color: #28a745;"">-{voucherDiscount:N0} VNĐ</td>
                </tr>";
            }

            decimal finalAmount = order.TotalAmount;

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
        .alert {{ background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin: 20px 0; border-radius: 5px; }}
        .highlight {{ background-color: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h2>🎉 Cảm ơn bạn đã mua hàng tại SHN Gear!</h2>
        </div>
        <div style=""padding: 20px;"">
            <p>Chào <strong>{user.FullName}</strong>,</p>
            <p>Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất. Dưới đây là chi tiết đơn hàng:</p>
            
            <div class=""highlight"">
                <p><strong>📦 Mã đơn hàng:</strong> #{order.Id}</p>
                <p><strong>📅 Ngày đặt:</strong> {order.OrderDate:dd/MM/yyyy HH:mm}</p>
                <p><strong>🔄 Trạng thái:</strong> {order.OrderStatus}</p>
                <p><strong>💳 Phương thức thanh toán:</strong> {order.PaymentMethod?.Name ?? "N/A"}</p>
            </div>
            
            <div class=""alert"">
                <strong>⏰ Lưu ý quan trọng:</strong> Đơn hàng của bạn sẽ được <strong>xác nhận và xử lý sau 2 giờ</strong> kể từ thời điểm đặt hàng. 
                Vui lòng kiên nhẫn chờ đợi hoặc liên hệ hotline nếu cần hỗ trợ.
            </div>
            
            <hr>
            <h3>📋 Chi tiết sản phẩm</h3>
            <table style=""width: 100%; border-collapse: collapse;"">
                <thead>
                    <tr style=""background-color: #f8f9fa;"">
                        <th style=""padding: 12px; border-bottom: 2px solid #ddd; text-align: left;"">Sản phẩm</th>
                        <th style=""padding: 12px; border-bottom: 2px solid #ddd; text-align: center;"">SL</th>
                        <th style=""padding: 12px; border-bottom: 2px solid #ddd; text-align: right;"">Đơn giá</th>
                        <th style=""padding: 12px; border-bottom: 2px solid #ddd; text-align: right;"">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {itemsHtml}
                </tbody>
                <tfoot>
                    <tr style=""background-color: #f8f9fa;"">
                        <td colspan=""3"" style=""padding: 12px; text-align: right; font-weight: bold;"">Tổng tiền hàng:</td>
                        <td style=""padding: 12px; text-align: right; font-weight: bold;"">{subtotal:N0} VNĐ</td>
                    </tr>
                    {voucherInfo}
                    <tr style=""background-color: #d4edda; border-top: 2px solid #28a745;"">
                        <td colspan=""3"" style=""padding: 15px; text-align: right; font-weight: bold; font-size: 1.1em; color: #155724;"">💰 TỔNG THANH TOÁN:</td>
                        <td style=""padding: 15px; text-align: right; font-weight: bold; font-size: 1.2em; color: #d9534f;"">{finalAmount:N0} VNĐ</td>
                    </tr>
                </tfoot>
            </table>
            
            <hr>
            <h3>🚚 Thông tin giao hàng</h3>
            <div style=""background-color: #f8f9fa; padding: 15px; border-radius: 5px;"">
                <p><strong>👤 Người nhận:</strong> {order.Address?.FullName ?? "N/A"}</p>
                <p><strong>📍 Địa chỉ:</strong> {order.Address?.AddressLine1 ?? "N/A"}, {order.Address?.City ?? "N/A"}</p>
                <p><strong>📞 Điện thoại:</strong> {order.Address?.PhoneNumber ?? "N/A"}</p>
            </div>
            
            <div style=""background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2196f3;"">
                <h4 style=""margin: 0 0 10px 0; color: #1976d2;"">📋 Quy trình xử lý đơn hàng:</h4>
                <ol style=""margin: 0; padding-left: 20px;"">
                    <li>✅ Đơn hàng đã được tiếp nhận</li>
                    <li>⏳ Xác nhận và chuẩn bị hàng (sau 2 giờ)</li>
                    <li>🚚 Giao hàng và nhận tiền</li>
                    <li>🎉 Hoàn tất đơn hàng</li>
                </ol>
            </div>
            
            <div style=""text-align: center; margin-top: 30px;"">
                <a href=""{_config["WebAppBaseUrl"]}/profile/orders"" class=""button"">🔍 Theo dõi đơn hàng</a>
            </div>
        </div>
        <div class=""footer"">
            <p><strong>SHN Gear</strong> &copy; {DateTime.Now.Year} - Công nghệ hàng đầu</p>
            <p>📧 Email: support@shngear.com | 📞 Hotline: 0123-456-789</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
        </div>
    </div>
</body>
</html>";
            return html;
        }

        public async Task SendPasswordResetEmailAsync(string recipientEmail, string resetLink)
        {
            string smtpHost = EnvironmentConfig.Email.SmtpHost ?? _config["EmailSettings:SMTPHost"] ?? "smtp.gmail.com";
            int smtpPort = EnvironmentConfig.Email.SmtpPort > 0 ? EnvironmentConfig.Email.SmtpPort : int.Parse(_config["EmailSettings:SMTPPort"] ?? "587");
            string senderEmail = EnvironmentConfig.Email.SenderEmail ?? _config["EmailSettings:SenderEmail"] ?? throw new InvalidOperationException("Sender email not configured");
            string senderPassword = EnvironmentConfig.Email.SenderPassword ?? _config["EmailSettings:SenderPassword"] ?? throw new InvalidOperationException("Sender password not configured");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("SHN Gear", senderEmail));
            message.To.Add(new MailboxAddress("", recipientEmail));
            message.Subject = "Đặt lại mật khẩu SHN Gear";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family: monospace; background:#f4f4f4; padding:40px;'>
  <div style='max-width:500px; margin:auto; background:#ffffff; border:2px solid #000; padding:32px;'>
    <div style='background:#000; color:#fff; padding:16px; margin-bottom:24px;'>
      <h2 style='margin:0; letter-spacing:2px;'>SHN GEAR // ĐẶT LẠI MẬT KHẨU</h2>
    </div>
    <p style='color:#333;'>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>{recipientEmail}</strong>.</p>
    <p style='color:#333;'>Nhấn vào nút bên dưới để đặt lại mật khẩu. Link có hiệu lực trong <strong>1 giờ</strong>.</p>
    <div style='text-align:center; margin:32px 0;'>
      <a href='{resetLink}' style='background:#000; color:#fff; padding:14px 32px; text-decoration:none; font-weight:bold; letter-spacing:1px; border:2px solid #000; display:inline-block;'>
        ĐẶT LẠI MẬT KHẨU
      </a>
    </div>
    <p style='color:#666; font-size:12px;'>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
    <p style='color:#666; font-size:12px;'>Link: {resetLink}</p>
    <div style='border-top:2px solid #000; margin-top:24px; padding-top:16px;'>
      <p style='color:#999; font-size:11px; margin:0;'>© SHN GEAR — Không trả lời email này.</p>
    </div>
  </div>
</body>
</html>"
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(senderEmail, senderPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
    }
}
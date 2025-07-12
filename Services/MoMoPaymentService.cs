using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using SHN_Gear.Configuration;

namespace SHN_Gear.Services
{
    public class MoMoPaymentService
    {
        private readonly IConfiguration _configuration;

        public MoMoPaymentService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<string> CreatePaymentAsync(string orderId, string orderInfo, long amount, bool isCardPayment = false)
        {
            // Sử dụng environment variables hoặc fallback về appsettings
            var partnerCode = EnvironmentConfig.MoMo.PartnerCode ?? _configuration["MoMoConfig:PartnerCode"] ?? throw new InvalidOperationException("MoMo PartnerCode not configured");
            var accessKey = EnvironmentConfig.MoMo.AccessKey ?? _configuration["MoMoConfig:AccessKey"] ?? throw new InvalidOperationException("MoMo AccessKey not configured");
            var secretKey = EnvironmentConfig.MoMo.SecretKey ?? _configuration["MoMoConfig:SecretKey"] ?? throw new InvalidOperationException("MoMo SecretKey not configured");
            var apiEndpoint = EnvironmentConfig.MoMo.ApiEndpoint ?? _configuration["MoMoConfig:ApiEndpoint"] ?? throw new InvalidOperationException("MoMo ApiEndpoint not configured");
            var returnUrl = EnvironmentConfig.MoMo.ReturnUrl ?? _configuration["MoMoConfig:ReturnUrl"] ?? throw new InvalidOperationException("MoMo ReturnUrl not configured");
            var notifyUrl = EnvironmentConfig.MoMo.NotifyUrl ?? _configuration["MoMoConfig:NotifyUrl"] ?? throw new InvalidOperationException("MoMo NotifyUrl not configured");

            // Tạo requestId mới cho mỗi lần gọi API
            var requestId = Guid.NewGuid().ToString();
            var requestType = isCardPayment ? "capture" : "captureWallet";
            var extraData = isCardPayment ? "{\"paymentType\":\"CREDIT_CARD\"}" : "";

            // Tạo rawHash với requestId
            var rawHash = "accessKey=" + accessKey +
                         "&amount=" + amount +
                         "&extraData=" + extraData +
                         "&ipnUrl=" + notifyUrl +
                         "&orderId=" + orderId +
                         "&orderInfo=" + orderInfo +
                         "&partnerCode=" + partnerCode +
                         "&redirectUrl=" + returnUrl +
                         "&requestId=" + requestId +  // Đảm bảo requestId được thêm vào
                         "&requestType=" + requestType;

            var signature = ComputeHmacSha256(rawHash, secretKey);

            var requestBody = new
            {
                partnerCode = partnerCode,
                partnerName = "SHN Gear",
                requestId = requestId,  // Truyền requestId vào body
                amount = amount,
                orderId = orderId,
                orderInfo = orderInfo,
                redirectUrl = returnUrl,
                ipnUrl = notifyUrl,
                requestType = requestType,
                extraData = extraData,
                signature = signature,
                lang = "vi"
            };

            using (var httpClient = new HttpClient())
            {
                var content = new StringContent(
                    JsonConvert.SerializeObject(requestBody),
                    Encoding.UTF8,
                    "application/json");

                var response = await httpClient.PostAsync(apiEndpoint, content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"Lỗi từ MoMo API: {response.StatusCode} - {errorContent}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseData = JsonConvert.DeserializeObject<Dictionary<string, string>>(responseContent);

                return responseData?["payUrl"] ?? throw new Exception("Không nhận được URL thanh toán từ MoMo");
            }
        }

        public bool VerifySignature(string signature, string rawData)
        {
            var secretKey = EnvironmentConfig.MoMo.SecretKey ?? _configuration["MoMoConfig:SecretKey"] ?? throw new InvalidOperationException("MoMo SecretKey not configured");
            var computedSignature = ComputeHmacSha256(rawData, secretKey);
            return signature.Equals(computedSignature, StringComparison.OrdinalIgnoreCase);
        }

        private string ComputeHmacSha256(string message, string secretKey)
        {
            using (var hmacsha256 = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey)))
            {
                var hashMessage = hmacsha256.ComputeHash(Encoding.UTF8.GetBytes(message));
                return BitConverter.ToString(hashMessage).Replace("-", "").ToLower();
            }
        }
    }
}
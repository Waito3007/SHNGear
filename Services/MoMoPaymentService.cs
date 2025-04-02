using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

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
            var momoConfig = _configuration.GetSection("MoMoConfig");

            // Tạo requestId mới cho mỗi lần gọi API
            var requestId = Guid.NewGuid().ToString();
            var requestType = isCardPayment ? "capture" : "captureWallet";
            var extraData = isCardPayment ? "{\"paymentType\":\"CREDIT_CARD\"}" : "";

            // Tạo rawHash với requestId
            var rawHash = "accessKey=" + momoConfig["AccessKey"] +
                         "&amount=" + amount +
                         "&extraData=" + extraData +
                         "&ipnUrl=" + momoConfig["NotifyUrl"] +
                         "&orderId=" + orderId +
                         "&orderInfo=" + orderInfo +
                         "&partnerCode=" + momoConfig["PartnerCode"] +
                         "&redirectUrl=" + momoConfig["ReturnUrl"] +
                         "&requestId=" + requestId +  // Đảm bảo requestId được thêm vào
                         "&requestType=" + requestType;

            var signature = ComputeHmacSha256(rawHash, momoConfig["SecretKey"]);

            var requestBody = new
            {
                partnerCode = momoConfig["PartnerCode"],
                partnerName = "SHN Gear",
                requestId = requestId,  // Truyền requestId vào body
                amount = amount,
                orderId = orderId,
                orderInfo = orderInfo,
                redirectUrl = momoConfig["ReturnUrl"],
                ipnUrl = momoConfig["NotifyUrl"],
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

                var response = await httpClient.PostAsync(momoConfig["ApiEndpoint"], content);

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
            var secretKey = _configuration["MoMoConfig:SecretKey"];
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
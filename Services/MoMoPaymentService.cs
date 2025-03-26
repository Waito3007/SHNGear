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

        public async Task<string> CreatePaymentAsync(string orderId, string orderInfo, long amount, string paymentType = "captureWallet")
        {
            var momoConfig = _configuration.GetSection("MoMoConfig");

            var requestId = Guid.NewGuid().ToString();
            var extraData = "";

            // Thêm paymentType vào rawHash
            var rawHash = "accessKey=" + momoConfig["AccessKey"] +
                         "&amount=" + amount +
                         "&extraData=" + extraData +
                         "&ipnUrl=" + momoConfig["NotifyUrl"] +
                         "&orderId=" + orderId +
                         "&orderInfo=" + orderInfo +
                         "&partnerCode=" + momoConfig["PartnerCode"] +
                         "&redirectUrl=" + momoConfig["ReturnUrl"] +
                         "&requestId=" + requestId +
                         "&requestType=" + paymentType; // Sử dụng paymentType được truyền vào

            var signature = ComputeHmacSha256(rawHash, momoConfig["SecretKey"]);

            var requestBody = new
            {
                partnerCode = momoConfig["PartnerCode"],
                partnerName = "SHN Gear",
                requestId = requestId,
                amount = amount,
                orderId = orderId,
                orderInfo = orderInfo,
                redirectUrl = momoConfig["ReturnUrl"],
                ipnUrl = momoConfig["NotifyUrl"],
                requestType = paymentType, // Sử dụng paymentType
                extraData = extraData,
                signature = signature,
                lang = "vi"
            };

            // Gọi API MoMo
            using (var httpClient = new HttpClient())
            {
                var content = new StringContent(
                    JsonConvert.SerializeObject(requestBody),
                    Encoding.UTF8,
                    "application/json");

                var response = await httpClient.PostAsync(momoConfig["ApiEndpoint"], content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseData = JsonConvert.DeserializeObject<Dictionary<string, string>>(responseContent);

                    if (responseData.ContainsKey("payUrl"))
                    {
                        return responseData["payUrl"];
                    }
                    throw new Exception("Không nhận được URL thanh toán từ MoMo");
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi từ MoMo API: {response.StatusCode} - {errorContent}");
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
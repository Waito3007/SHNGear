using DotNetEnv;

namespace SHN_Gear.Configuration
{
    public static class EnvironmentConfig
    {
        public static void LoadEnvironmentVariables()
        {
            // Load .env file if it exists
            if (File.Exists(".env"))
            {
                Env.Load();
            }
        }

        public static string GetConnectionString()
        {
            var server = Environment.GetEnvironmentVariable("DB_SERVER");
            var database = Environment.GetEnvironmentVariable("DB_NAME");
            var trustedConnection = Environment.GetEnvironmentVariable("DB_TRUSTED_CONNECTION");
            var multipleActiveResultSets = Environment.GetEnvironmentVariable("DB_MULTIPLE_ACTIVE_RESULT_SETS");
            var trustServerCertificate = Environment.GetEnvironmentVariable("DB_TRUST_SERVER_CERTIFICATE");

            if (!string.IsNullOrEmpty(server) && !string.IsNullOrEmpty(database))
            {
                return $"Server={server};Database={database};Trusted_Connection={trustedConnection ?? "True"};MultipleActiveResultSets={multipleActiveResultSets ?? "False"};TrustServerCertificate={trustServerCertificate ?? "True"}";
            }

            return string.Empty;
        }

        public static class Jwt
        {
            public static string SecretKey => Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? string.Empty;
            public static string Issuer => Environment.GetEnvironmentVariable("JWT_ISSUER") ?? string.Empty;
            public static string Audience => Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? string.Empty;
        }

        public static class Email
        {
            public static string SmtpHost => Environment.GetEnvironmentVariable("SMTP_HOST") ?? string.Empty;
            public static int SmtpPort => int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var port) ? port : 587;
            public static string SenderEmail => Environment.GetEnvironmentVariable("SENDER_EMAIL") ?? string.Empty;
            public static string SenderPassword => Environment.GetEnvironmentVariable("SENDER_PASSWORD") ?? string.Empty;
        }

        public static class Cloudinary
        {
            public static string CloudName => Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME") ?? string.Empty;
            public static string ApiKey => Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY") ?? string.Empty;
            public static string ApiSecret => Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET") ?? string.Empty;
        }

        public static class MoMo
        {
            public static string PartnerCode => Environment.GetEnvironmentVariable("MOMO_PARTNER_CODE") ?? string.Empty;
            public static string AccessKey => Environment.GetEnvironmentVariable("MOMO_ACCESS_KEY") ?? string.Empty;
            public static string SecretKey => Environment.GetEnvironmentVariable("MOMO_SECRET_KEY") ?? string.Empty;
            public static string ApiEndpoint => Environment.GetEnvironmentVariable("MOMO_API_ENDPOINT") ?? string.Empty;
            public static string ReturnUrl => Environment.GetEnvironmentVariable("MOMO_RETURN_URL") ?? string.Empty;
            public static string NotifyUrl => Environment.GetEnvironmentVariable("MOMO_NOTIFY_URL") ?? string.Empty;
        }

        public static class PayPal
        {
            public static string ClientId => Environment.GetEnvironmentVariable("PAYPAL_CLIENT_ID") ?? string.Empty;
            public static string Secret => Environment.GetEnvironmentVariable("PAYPAL_SECRET") ?? string.Empty;
            public static string Mode => Environment.GetEnvironmentVariable("PAYPAL_MODE") ?? "Sandbox";
        }

        public static class Gemini
        {
            public static string ApiKey => Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? string.Empty;
            public static string Model => Environment.GetEnvironmentVariable("GEMINI_MODEL") ?? "gemini-1.5-flash";
            public static int MaxTokens => int.TryParse(Environment.GetEnvironmentVariable("GEMINI_MAX_TOKENS"), out var maxTokens) ? maxTokens : 150;
            public static double Temperature => double.TryParse(Environment.GetEnvironmentVariable("GEMINI_TEMPERATURE"), out var temperature) ? temperature : 0.7;
            public static string BaseUrl => Environment.GetEnvironmentVariable("GEMINI_BASE_URL") ?? string.Empty;
        }
    }
}

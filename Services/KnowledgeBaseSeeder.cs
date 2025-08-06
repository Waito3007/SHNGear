using SHN_Gear.Models;

namespace SHN_Gear.Services
{
    public class KnowledgeBaseSeeder
    {
        public static List<AIKnowledgeBase> GetDefaultKnowledgeBase()
        {
            return new List<AIKnowledgeBase>
            {
                // PRODUCT INFO
                new AIKnowledgeBase
                {
                    Topic = "product_info",
                    Question = "Có những loại sản phẩm gì?",
                    Answer = "SHN-Gear chuyên cung cấp 3 loại sản phẩm chính:\n" +
                            "📱 Điện thoại: iPhone, Samsung Galaxy, Xiaomi, Oppo, Vivo\n" +
                            "💻 Laptop: MacBook, Dell, HP, Asus, Acer, Lenovo\n" +
                            "🎧 Tai nghe: AirPods, Sony, JBL, Beats, Samsung Buds\n\n" +
                            "Tất cả đều là hàng chính hãng, bảo hành đầy đủ!",
                    Keywords = ["sản phẩm", "bán gì", "có gì", "loại nào", "categories"],
                    Category = KnowledgeCategory.ProductInfo,
                    Priority = 10,
                    MinConfidenceScore = 0.8m
                },

                new AIKnowledgeBase
                {
                    Topic = "product_info",
                    Question = "iPhone có những phiên bản nào?",
                    Answer = "Hiện tại SHN-Gear có đầy đủ các dòng iPhone:\n" +
                            "🔥 iPhone 15 Series: 15, 15 Plus, 15 Pro, 15 Pro Max\n" +
                            "📱 iPhone 14 Series: 14, 14 Plus, 14 Pro, 14 Pro Max\n" +
                            "💫 iPhone 13 Series: 13, 13 mini, 13 Pro, 13 Pro Max\n" +
                            "⚡ iPhone 12 Series và iPhone SE\n\n" +
                            "Tất cả đều VN/A chính hãng, đủ màu đủ dung lượng!",
                    Keywords = ["iphone", "apple", "ip", "điện thoại apple"],
                    Category = KnowledgeCategory.ProductInfo,
                    Priority = 9,
                    ProductCategoryIds = "[1]", // Phone category
                    BrandIds = "[1]" // Apple brand (giả sử)
                },

                // PRICING
                new AIKnowledgeBase
                {
                    Topic = "pricing",
                    Question = "Có chương trình khuyến mãi không?",
                    Answer = "SHN-Gear luôn có nhiều chương trình hấp dẫn:\n" +
                            "🎉 Flash Sale cuối tuần: giảm đến 30%\n" +
                            "💳 Trả góp 0%: 6-12 tháng không lãi suất\n" +
                            "🎁 Tặng phụ kiện: ốp lưng, cáp sạc, tai nghe\n" +
                            "💰 Thu cũ đổi mới: giá cao, thủ tục nhanh\n" +
                            "🏷️ Voucher sinh nhật: ưu đãi đặc biệt\n\n" +
                            "Theo dõi fanpage để cập nhật khuyến mãi mới nhất nhé!",
                    Keywords = ["khuyến mãi", "giảm giá", "ưu đãi", "sale", "promotion"],
                    Category = KnowledgeCategory.Pricing,
                    Priority = 9
                },

                new AIKnowledgeBase
                {
                    Topic = "pricing",
                    Question = "Có trả góp không?",
                    Answer = "Có! SHN-Gear hỗ trợ nhiều hình thức trả góp:\n" +
                            "🏦 Trả góp qua thẻ tín dụng: 3-24 tháng\n" +
                            "💳 Trả góp 0% lãi suất: 6-12 tháng\n" +
                            "📱 Trả góp online: duyệt nhanh 15 phút\n" +
                            "🏪 Trả góp tại cửa hàng: thủ tục đơn giản\n\n" +
                            "Điều kiện: CMND + sổ hộ khẩu. Từ 18 tuổi trở lên.",
                    Keywords = ["trả góp", "installment", "góp", "trả chậm"],
                    Category = KnowledgeCategory.Pricing,
                    Priority = 8
                },

                // SHIPPING
                new AIKnowledgeBase
                {
                    Topic = "shipping",
                    Question = "Giao hàng mất bao lâu?",
                    Answer = "Thời gian giao hàng tùy theo khu vực:\n" +
                            "🏍️ Nội thành HN, HCM: 2-4 giờ (giao nhanh)\n" +
                            "🚚 Các tỉnh thành khác: 1-3 ngày làm việc\n" +
                            "📦 Vùng xa, miền núi: 3-5 ngày làm việc\n" +
                            "⚡ Giao siêu tốc: trong 1 giờ (một số khu vực)\n\n" +
                            "📞 Shipper sẽ gọi trước khi giao 30 phút!",
                    Keywords = ["giao hàng", "ship", "delivery", "bao lâu", "khi nào"],
                    Category = KnowledgeCategory.Shipping,
                    Priority = 9
                },

                new AIKnowledgeBase
                {
                    Topic = "shipping",
                    Question = "Phí giao hàng bao nhiêu?",
                    Answer = "Chính sách giao hàng của SHN-Gear:\n" +
                            "🆓 Miễn phí: đơn hàng từ 500,000đ\n" +
                            "🏍️ Giao nhanh nội thành: 30,000đ\n" +
                            "🚚 Giao tiêu chuẩn: 20,000-50,000đ\n" +
                            "⚡ Giao siêu tốc (1h): 100,000đ\n\n" +
                            "💡 Tip: Mua đủ 500k để được freeship nhé!",
                    Keywords = ["phí giao hàng", "phí ship", "shipping fee", "tiền ship"],
                    Category = KnowledgeCategory.Shipping,
                    Priority = 8
                },

                // RETURNS
                new AIKnowledgeBase
                {
                    Topic = "returns",
                    Question = "Chính sách đổi trả như thế nào?",
                    Answer = "Chính sách đổi trả linh hoạt tại SHN-Gear:\n" +
                            "⏰ Thời gian: 7 ngày kể từ ngày mua\n" +
                            "📦 Điều kiện: Nguyên seal, chưa sử dụng\n" +
                            "📄 Giấy tờ: Hóa đơn + phiếu bảo hành\n" +
                            "💸 Hoàn tiền: 100% giá trị sản phẩm\n" +
                            "🔄 Đổi sang SP khác: nếu có chênh lệch\n\n" +
                            "🏪 Đổi trả tại cửa hàng hoặc gọi hotline!",
                    Keywords = ["đổi trả", "return", "hoàn tiền", "đổi sản phẩm"],
                    Category = KnowledgeCategory.Returns,
                    Priority = 9
                },

                new AIKnowledgeBase
                {
                    Topic = "returns",
                    Question = "Bảo hành như thế nào?",
                    Answer = "Chế độ bảo hành toàn diện:\n" +
                            "📱 Điện thoại: 12 tháng chính hãng\n" +
                            "💻 Laptop: 12-24 tháng tùy hãng\n" +
                            "🎧 Tai nghe: 6-12 tháng\n" +
                            "⚡ Bảo hành nhanh: 1-3 ngày\n" +
                            "🔄 Đổi mới: nếu lỗi NSX trong 30 ngày\n\n" +
                            "🏭 Trung tâm bảo hành ủy quyền chính thức!",
                    Keywords = ["bảo hành", "warranty", "sửa chữa", "lỗi"],
                    Category = KnowledgeCategory.Returns,
                    Priority = 8
                },

                // ACCOUNT
                new AIKnowledgeBase
                {
                    Topic = "account",
                    Question = "Làm sao để đăng ký tài khoản?",
                    Answer = "Đăng ký tài khoản SHN-Gear rất đơn giản:\n" +
                            "1️⃣ Click nút 'Đăng ký' góc phải màn hình\n" +
                            "2️⃣ Nhập email + số điện thoại\n" +
                            "3️⃣ Tạo mật khẩu mạnh (8+ ký tự)\n" +
                            "4️⃣ Xác thực OTP qua SMS\n" +
                            "5️⃣ Hoàn thành thông tin cá nhân\n\n" +
                            "🎁 Tặng voucher 100k cho lần mua đầu tiên!",
                    Keywords = ["đăng ký", "tạo tài khoản", "register", "sign up"],
                    Category = KnowledgeCategory.Account,
                    Priority = 7
                },

                // PAYMENT
                new AIKnowledgeBase
                {
                    Topic = "payment",
                    Question = "Có những hình thức thanh toán nào?",
                    Answer = "SHN-Gear hỗ trợ đa dạng phương thức thanh toán:\n" +
                            "💰 Tiền mặt: khi nhận hàng (COD)\n" +
                            "💳 Thẻ tín dụng: Visa, Master, JCB\n" +
                            "🏦 Chuyển khoản: ngân hàng, ví điện tử\n" +
                            "📱 Ví MoMo, ZaloPay, ShopeePay\n" +
                            "💎 PayPal: cho khách quốc tế\n\n" +
                            "🔒 Bảo mật SSL 256-bit, an toàn tuyệt đối!",
                    Keywords = ["thanh toán", "payment", "trả tiền", "phương thức"],
                    Category = KnowledgeCategory.Payment,
                    Priority = 8
                },

                // TECHNICAL SUPPORT
                new AIKnowledgeBase
                {
                    Topic = "technical",
                    Question = "Sản phẩm bị lỗi thì làm sao?",
                    Answer = "Nếu sản phẩm gặp sự cố, hãy làm theo hướng dẫn:\n" +
                            "1️⃣ Kiểm tra lại cách sử dụng trong hướng dẫn\n" +
                            "2️⃣ Restart/khởi động lại thiết bị\n" +
                            "3️⃣ Liên hệ hotline: 1900-XXX-XXX\n" +
                            "4️⃣ Mang sản phẩm đến cửa hàng kiểm tra\n" +
                            "5️⃣ Bảo hành/đổi mới nếu thuộc điều kiện\n\n" +
                            "🔧 Team kỹ thuật hỗ trợ 24/7!",
                    Keywords = ["lỗi", "hỏng", "không hoạt động", "sửa", "technical"],
                    Category = KnowledgeCategory.Technical,
                    Priority = 7,
                    EscalationThreshold = 0.2m // Lower threshold for technical issues - should escalate faster
                },

                // GENERAL
                new AIKnowledgeBase
                {
                    Topic = "general",
                    Question = "Thông tin liên hệ cửa hàng?",
                    Answer = "Thông tin liên hệ SHN-Gear:\n" +
                            "📍 Địa chỉ: [Địa chỉ cửa hàng]\n" +
                            "📞 Hotline: 1900-XXX-XXX\n" +
                            "📧 Email: support@shngear.com\n" +
                            "🕒 Giờ làm việc: 8:00 - 22:00 (T2-CN)\n" +
                            "🌐 Website: shngear.com\n" +
                            "📘 Facebook: fb.com/shngear\n\n" +
                            "💬 Chat online 24/7 tại website!",
                    Keywords = ["liên hệ", "địa chỉ", "hotline", "contact", "thông tin"],
                    Category = KnowledgeCategory.General,
                    Priority = 6
                },

                new AIKnowledgeBase
                {
                    Topic = "general",
                    Question = "Có cửa hàng offline không?",
                    Answer = "SHN-Gear có hệ thống cửa hàng toàn quốc:\n" +
                            "🏪 Hà Nội: 5 cửa hàng\n" +
                            "🏪 TP.HCM: 8 cửa hàng\n" +
                            "🏪 Đà Nẵng: 2 cửa hàng\n" +
                            "🏪 Cần Thơ: 1 cửa hàng\n" +
                            "🏪 Hải Phòng: 1 cửa hàng\n\n" +
                            "📍 Xem địa chỉ chi tiết tại: shngear.com/stores\n" +
                            "🚗 Miễn phí gửi xe tại tất cả cửa hàng!",
                    Keywords = ["cửa hàng", "offline", "địa chỉ", "store", "chi nhánh"],
                    Category = KnowledgeCategory.General,
                    Priority = 7
                }
            };
        }
    }
}

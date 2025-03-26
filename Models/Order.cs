namespace SHN_Gear.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public User? User { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = "Pending";
        public int? AddressId { get; set; }
        public Address? Address { get; set; }
        public int PaymentMethodId { get; set; }
        public PaymentMethod PaymentMethod { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public int? VoucherId { get; set; }
        public Voucher? Voucher { get; set; }

        // Thêm các trường mới cho MoMo
        public string? MoMoRequestId { get; set; } // Mã request từ MoMo
        public string? MoMoOrderId { get; set; } // Mã đơn hàng gửi sang MoMo
        public string? MoMoTransId { get; set; } // Mã giao dịch từ MoMo
        public string? MoMoPayUrl { get; set; } // URL thanh toán MoMo
        public string? MoMoResponse { get; set; } // Raw response từ MoMo
    }
}
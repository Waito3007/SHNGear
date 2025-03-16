namespace SHN_Gear.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int? UserId { get; set; } // Khóa ngoại tới User, cho phép null
        public User? User { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; } = "Pending"; // Ví dụ: Pending, Processing, Shipped, Delivered, Cancelled
        public int? AddressId { get; set; } // Khóa ngoại tới Address
        public Address? Address { get; set; }
        public int PaymentMethodId { get; set; } // Khóa ngoại tới PaymentMethod
        public PaymentMethod PaymentMethod { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>(); // Danh sách các mặt hàng trong đơn hàng
    }
}

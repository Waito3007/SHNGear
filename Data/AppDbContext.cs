using Microsoft.EntityFrameworkCore;
using SHN_Gear.Models;

namespace SHN_Gear.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Định nghĩa các bảng
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<PhoneSpecification> PhoneSpecifications { get; set; }
        public DbSet<LaptopSpecification> LaptopSpecifications { get; set; }
        public DbSet<HeadphoneSpecification> HeadphoneSpecifications { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; } // Thêm DbSet cho ProductVariant
        public DbSet<Category> Categories { get; set; } // Thêm DbSet cho Category
        public DbSet<Brand> Brands { get; set; } // Thêm DbSet cho Brand
        public DbSet<Order> Orders { get; set; } // Thêm DbSet cho Order
        public DbSet<OrderItem> OrderItems { get; set; } // Thêm DbSet cho OrderItem
        public DbSet<Address> Addresses { get; set; } // Thêm DbSet cho Address
        public DbSet<PaymentMethod> PaymentMethods { get; set; } // Thêm DbSet cho PaymentMethod
        public DbSet<Review> Reviews { get; set; } // Thêm DbSet cho Review
        public DbSet<Delivery> Deliveries { get; set; } // Thêm DbSet cho Delivery        
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<UserVoucher> UserVouchers { get; set; } // Thêm DbSet cho UserVoucher
        public DbSet<HomePageSettings> HomePageSettings { get; set; } // Thêm DbSet cho HomePageSettings

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed dữ liệu mặc định cho Role
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "VIP 1" },
                new Role { Id = 3, Name = "VIP 2" },
                new Role { Id = 4, Name = "VIP 3" }
            );
            // ✅ Seed dữ liệu mặc định cho PaymentMethod
            modelBuilder.Entity<PaymentMethod>().HasData(
                new PaymentMethod { Id = 1, Name = "Tiền Mặt", Description = "Thanh toán bằng tiền mặt" },
                new PaymentMethod { Id = 2, Name = "MoMo", Description = "Thanh toán bằng Momo" },
                new PaymentMethod { Id = 3, Name = "Paypal", Description = "Thanh toán bằng ví Paypal" }
            );
            // ✅ Thiết lập quan hệ Category - Product (1-N)
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId);

            // Thiết lập duy nhất cho số điện thoại (Không cho phép số trùng)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.PhoneNumber)
                .IsUnique();

            // Specify the SQL Server column type for the Price property in ProductVariant
            modelBuilder.Entity<ProductVariant>()
                .Property(pv => pv.Price)
                .HasColumnType("decimal(18,2)");

            // Specify the SQL Server column type for the DiscountPrice property in ProductVariant
            modelBuilder.Entity<ProductVariant>()
                .Property(pv => pv.DiscountPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .OnDelete(DeleteBehavior.Cascade); // Xóa đơn hàng thì xóa cả các mặt hàng trong đơn hàng.

            // Thiết lập khóa chính cho bảng UserVoucher
            modelBuilder.Entity<UserVoucher>()
                .HasKey(uv => new { uv.UserId, uv.VoucherId });

            // Thiết lập quan hệ giữa User và UserVoucher
            modelBuilder.Entity<UserVoucher>()
                .HasOne(uv => uv.User)
                .WithMany(u => u.UserVouchers)
                .HasForeignKey(uv => uv.UserId);

            // Thiết lập quan hệ giữa Voucher và UserVoucher
            modelBuilder.Entity<UserVoucher>()
                .HasOne(uv => uv.Voucher)
                .WithMany(v => v.UserVouchers)
                .HasForeignKey(uv => uv.VoucherId);

            modelBuilder.Entity<Review>(entity =>
   {
       // Review có một User, User (có thể) có nhiều Review
       entity.HasOne(r => r.User) // Sử dụng navigation property 'User' trong Review
             .WithMany()          // Giả định User không có navigation property trỏ về Review list (hoặc thêm vào nếu có: .WithMany(u => u.Reviews))
             .HasForeignKey(r => r.UserId) // Chỉ định 'UserId' (kiểu string) là khóa ngoại
             .IsRequired();       // Đánh giá luôn cần User

       // Quan trọng: Kiểu dữ liệu của Review.UserId (string) phải khớp với kiểu khóa chính của User entity.
       // Nếu khóa chính của User là int/Guid, bạn cần sửa lại kiểu UserId trong Review hoặc cấu hình khác.
   });

            modelBuilder.Entity<Delivery>(entity =>
    {
        // Giả định Delivery có thuộc tính ShippingCost
        entity.Property(d => d.ShippingCost).HasColumnType("decimal(18, 2)");
    });

            modelBuilder.Entity<Order>(entity =>
            {
                // Giả định Order có thuộc tính TotalAmount
                entity.Property(o => o.TotalAmount).HasColumnType("decimal(18, 2)");
            });

            modelBuilder.Entity<OrderItem>(entity =>
            {
                // Giả định OrderItem có thuộc tính Price (ngoài giá gốc từ ProductVariant)
                // Nếu OrderItem không có cột Price riêng mà dùng giá từ ProductVariant thì không cần dòng này
                entity.Property(oi => oi.Price).HasColumnType("decimal(18, 2)");
            });
            modelBuilder.Entity<Voucher>(entity =>
    {
        // Giả định Voucher có thuộc tính DiscountAmount
        entity.Property(v => v.DiscountAmount).HasColumnType("decimal(18, 2)");
    });
            // Thêm các quan hệ khác tương tự ở đây.
        }
    }
}

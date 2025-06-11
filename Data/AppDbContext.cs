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
        public DbSet<ProductSpecification> ProductSpecifications { get; set; }
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

            // Thêm các quan hệ khác tương tự ở đây.
        }
    }
}

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
        public DbSet<HomepageConfig> HomepageConfigurations { get; set; }
        public DbSet<Slider> Sliders { get; set; }
        public DbSet<Banner> Banners { get; set; }

        // Chat System DbSets
        public DbSet<ChatSession> ChatSessions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<AIKnowledgeBase> AIKnowledgeBases { get; set; }
        public DbSet<BlogPost> BlogPosts { get; set; }

        // Loyalty Spin
        public DbSet<LoyaltyPoint> LoyaltyPoints { get; set; }
        public DbSet<SpinConfig> SpinConfigs { get; set; }
        public DbSet<SpinItem> SpinItems { get; set; }
        public DbSet<SpinHistory> SpinHistories { get; set; }

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

            // ✅ Seed dữ liệu mặc định cho SpinConfig
            modelBuilder.Entity<SpinConfig>().HasData(
                new SpinConfig { Id = 1, SpinCost = 100, UpdatedAt = new DateTime(2024, 7, 12, 0, 0, 0, DateTimeKind.Utc) }
            );

            // ✅ Seed dữ liệu mặc định cho SpinItems
            modelBuilder.Entity<SpinItem>().HasData(
                new SpinItem { Id = 1, Name = "Chúc may mắn lần sau", Description = "Hãy thử lại nhé!", DropRate = 0.4, IsLuckyNextTime = true },
                new SpinItem { Id = 2, Name = "Voucher 50K", Description = "Giảm 50,000đ cho đơn hàng từ 500K", DropRate = 0.15, VoucherCode = "VOUCHER50K" },
                new SpinItem { Id = 3, Name = "Voucher 100K", Description = "Giảm 100,000đ cho đơn hàng từ 1M", DropRate = 0.1, VoucherCode = "VOUCHER100K" },
                new SpinItem { Id = 4, Name = "Voucher 200K", Description = "Giảm 200,000đ cho đơn hàng từ 2M", DropRate = 0.05, VoucherCode = "VOUCHER200K" },
                new SpinItem { Id = 5, Name = "Freeship", Description = "Miễn phí vận chuyển", DropRate = 0.2, VoucherCode = "FREESHIP" },
                new SpinItem { Id = 6, Name = "Voucher 500K", Description = "Giảm 500,000đ cho đơn hàng từ 5M", DropRate = 0.02, VoucherCode = "VOUCHER500K" },
                new SpinItem { Id = 7, Name = "Điểm thưởng x2", Description = "Nhận gấp đôi điểm loyalty", DropRate = 0.08 }
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

            // Specify the SQL Server column type for FlashSalePrice in Product
            modelBuilder.Entity<Product>()
                .Property(p => p.FlashSalePrice)
                .HasColumnType("decimal(18,2)");

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
                entity.HasKey(r => r.Id);

                entity.Property(r => r.Comment).IsRequired();
                entity.Property(r => r.Rating);
                entity.Property(r => r.CreatedAt);
                entity.Property(r => r.IsApproved);

                entity.HasOne(r => r.User)
                    .WithMany(u => u.Reviews)
                    .HasForeignKey(r => r.UserId);

                entity.HasOne(r => r.Product) // ✅ mới
                    .WithMany()
                    .HasForeignKey(r => r.ProductId); // ✅ mới
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

            // ✅ Chat System decimal configurations
            modelBuilder.Entity<AIKnowledgeBase>(entity =>
            {
                entity.Property(a => a.EscalationThreshold).HasPrecision(5, 3); // 0.000 to 99.999
                entity.Property(a => a.MinConfidenceScore).HasPrecision(5, 3); // 0.000 to 99.999
            });

            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.Property(cm => cm.AIConfidenceScore).HasPrecision(5, 3); // 0.000 to 99.999

                // Configure relationship with SenderUser
                entity.HasOne(cm => cm.SenderUser)
                      .WithMany()
                      .HasForeignKey(cm => cm.SenderId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<ChatSession>(entity =>
            {
                entity.Property(cs => cs.ConfidenceScore).HasPrecision(5, 3); // 0.000 to 99.999
            });

            // Thêm các quan hệ khác tương tự ở đây.

            // Add indexes for query optimization
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasIndex(p => p.CategoryId).HasDatabaseName("IX_Products_CategoryId");
                entity.HasIndex(p => p.BrandId).HasDatabaseName("IX_Products_BrandId");
                entity.HasIndex(p => p.IsFlashSale).HasDatabaseName("IX_Products_IsFlashSale");
            });

            modelBuilder.Entity<ProductVariant>(entity =>
            {
                entity.HasIndex(pv => pv.ProductId).HasDatabaseName("IX_ProductVariants_ProductId");
                entity.HasIndex(pv => pv.Price).HasDatabaseName("IX_ProductVariants_Price");
            });

            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1, // Số nguyên
                CreatedAt = new DateTime(2024, 7, 12, 0, 0, 0, DateTimeKind.Utc)
            });
        }
    }
}

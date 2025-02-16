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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed dữ liệu mặc định cho Role
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "VIP 1" },
                new Role { Id = 3, Name = "VIP 2" },
                new Role { Id = 4, Name = "VIP 3" }
            );

            // Thiết lập duy nhất cho số điện thoại (Không cho phép số trùng)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.PhoneNumber)
                .IsUnique();
        }
    }
}

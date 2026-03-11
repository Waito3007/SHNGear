using SHN_Gear.Data;

namespace SHN_Gear.Services
{
    public class DatabaseSeeder
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(AppDbContext context, ILogger<DatabaseSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public Task SeedAsync()
        {
            _logger.LogInformation("Database seeding completed.");
            return Task.CompletedTask;
        }
    }
}

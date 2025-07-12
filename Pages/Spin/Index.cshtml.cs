using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using SHN_Gear.Data;
using SHN_Gear.Models;
using System.Collections.Generic;

namespace SHNGear.Pages.Spin
{
    public class IndexModel : PageModel
    {
        private readonly AppDbContext _db;
        public int LoyaltyPoints { get; set; }
        public SpinConfig SpinConfig { get; set; }
        public List<SpinItem> SpinItems { get; set; }
        public bool CanSpin { get; set; } = true;

        public IndexModel(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var userId = int.Parse(User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value ?? "0");
            var loyalty = await _db.LoyaltyPoints.FirstOrDefaultAsync(x => x.UserId == userId);
            LoyaltyPoints = loyalty?.Points ?? 0;
            SpinConfig = _db.SpinConfigs.FirstOrDefault();
            SpinItems = _db.SpinItems.OrderByDescending(x => x.DropRate).ToList();
            CanSpin = LoyaltyPoints >= (SpinConfig?.SpinCost ?? 0);
            return Page();
        }
    }
}

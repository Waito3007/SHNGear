using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;

namespace SHN_Gear.Pages.Admin
{
    [Authorize(Roles = "Admin")]
    public class BlogModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}

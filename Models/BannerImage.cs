namespace SHN_Gear.Models
{
    public class BannerImage
    {
        public int Id { get; set; }
        public int BannerId { get; set; }
        public string ImageUrl { get; set; } = null!;

        //Khóa ngoại
        public Banner Banner { get; set; } = null!;
    }
}
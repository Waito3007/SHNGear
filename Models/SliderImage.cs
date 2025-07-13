namespace SHN_Gear.Models
{
    public class SliderImage
    {
        public int Id { get; set; }
        public int SliderId { get; set; }
        public string ImageUrl { get; set; } = null!;

        //Khóa ngoại
        public Slider Slider { get; set; } = null!;
    }
}
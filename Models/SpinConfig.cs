using System;
namespace SHN_Gear.Models
{
    public class SpinConfig
    {
        public int Id { get; set; }
        public int SpinCost { get; set; } // Giá mỗi lượt quay (điểm)
        public DateTime UpdatedAt { get; set; }
    }
}

using System;
namespace SHN_Gear.Models
{
    public class SpinHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int SpinItemId { get; set; }
        public DateTime SpinAt { get; set; }
        public int PointsUsed { get; set; }
    }
}

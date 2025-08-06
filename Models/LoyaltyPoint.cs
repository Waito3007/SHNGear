using System;
namespace SHN_Gear.Models
{
    public class LoyaltyPoint
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Points { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}

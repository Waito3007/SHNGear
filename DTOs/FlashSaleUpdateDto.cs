using System;
using System.ComponentModel.DataAnnotations;

namespace SHN_Gear.DTOs
{
    public class FlashSaleUpdateDto
    {
        [Required]
        public decimal FlashSalePrice { get; set; }

        [Required]
        public DateTime FlashSaleStartDate { get; set; }

        [Required]
        public DateTime FlashSaleEndDate { get; set; }
    }
}

using System.Collections.Generic;

namespace SHN_Gear.DTOs
{
    public class CompareResultDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Brand { get; set; }
        public string Category { get; set; }
        public IEnumerable<ProductImageDto> Images { get; set; }
        public IEnumerable<ProductVariantDto> Variants { get; set; }
        public object Specifications { get; set; }
        public bool IsFlashSale { get; set; }
        public decimal? FlashSalePrice { get; set; }
        public DateTime? FlashSaleStartDate { get; set; }
        public DateTime? FlashSaleEndDate { get; set; }
    }
}

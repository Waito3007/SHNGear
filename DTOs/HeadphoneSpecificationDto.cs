namespace SHN_Gear
{
    public class HeadphoneSpecificationDto
    {
        public int ProductId { get; set; }
        public string Weight { get; set; } = null!;

        public string Type { get; set; } = null!; // Không dây, Chụp tai
        public string ConnectionType { get; set; } = null!;
        public string Port { get; set; } = null!;
    }

}
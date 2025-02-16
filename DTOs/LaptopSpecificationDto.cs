namespace SHN_Gear{
     public class LaptopSpecificationDto
{
    public int ProductId { get; set; }
    public string Weight { get; set; } = null!;
    public string Material { get; set; } = null!;
    public string CPUType { get; set; } = null!;
    public int CPUNumberOfCores { get; set; }
    public string RAM { get; set; } = null!;
    public string MaxRAMSupport { get; set; } = null!;
    public string SSDStorage { get; set; } = null!;
    public string ScreenSize { get; set; } = null!;
    public string Resolution { get; set; } = null!;
    public string RefreshRate { get; set; } = null!;
    public bool SupportsTouch { get; set; }
}

}
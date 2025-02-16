namespace SHN_Gear{
    public class PhoneSpecificationDto
{
    public int ProductId { get; set; }
    public string ScreenSize { get; set; } = null!;
    public string Resolution { get; set; } = null!;
    public string ScreenType { get; set; } = null!;
    public string Weight { get; set; } = null!;
    public string Material { get; set; } = null!;
    public string CPUModel { get; set; } = null!;
    public int CPUCores { get; set; }
    public string RAM { get; set; } = null!;
    public string InternalStorage { get; set; } = null!;
    public string FrontCamera { get; set; } = null!;
    public string RearCamera { get; set; } = null!;
    public string BatteryCapacity { get; set; } = null!;
    public bool SupportsNFC { get; set; }
}

}
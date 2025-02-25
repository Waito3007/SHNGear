namespace SHN_Gear.Models.DTOs
{
    public class RegisterRequestDTO
    {
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Gender { get; set; } = "Khác";
        public DateTime DateOfBirth { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}

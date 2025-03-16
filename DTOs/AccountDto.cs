namespace SHN_Gear.DTOs
{
    public class EmailDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class OtpRequestDto
    {
        public string Email { get; set; } = string.Empty;
    }
    
    public class EditProfileDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
    }


}
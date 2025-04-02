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
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }


    public class OtpRequestDto
    {
        public string Email { get; set; } = string.Empty;
    }


    public class EditProfileDto
    {

        public string FullName { get; set; } = string.Empty;


        public string Email { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? Gender { get; set; }

        public DateTime? DateOfBirth { get; set; }
    }

}
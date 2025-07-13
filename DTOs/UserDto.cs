namespace SHN_Gear.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int RoleId { get; set; }
    }
    public class RoleUpdateDto
    {
        public int RoleId { get; set; }
    }
    public class UserRoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }
}
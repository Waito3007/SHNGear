public class AdminUserUpdateDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public int RoleId { get; set; }
}

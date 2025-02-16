namespace SHN_Gear.Models
{
    public class Role
    {
        public int Id { get; set; }  // Id của vai trò (Admin, VIP 1, VIP 2,...)
        public string Name { get; set; } = string.Empty;  // Tên vai trò (Admin, VIP 1, VIP 2,...)
        
        public ICollection<User> Users { get; set; } = new List<User>(); // Danh sách người dùng có role này
    }
}

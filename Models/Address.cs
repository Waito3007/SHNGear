namespace SHN_Gear.Models
{
    public class Address
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!; // Khóa ngoại tới User
        public User User { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string AddressLine1 { get; set; } = null!;
        public string AddressLine2 { get; set; } = null!; // Có thể null
        public string City { get; set; } = null!;
        public string State { get; set; } = null!; // Có thể null
        public string ZipCode { get; set; } = null!;
        public string Country { get; set; } = null!;
    }
}

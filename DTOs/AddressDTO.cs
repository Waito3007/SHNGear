namespace SHN_Gear.DTOs
{
    public class AddressDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string AddressLine1 { get; set; } = null!;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string ZipCode { get; set; } = null!;
        public string Country { get; set; } = null!;
    }

    public class CreateAddressDTO
    {
        public int UserId { get; set; } // ✅ Đã sửa thành kiểu int
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string AddressLine1 { get; set; } = null!;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = null!;
        public string? State { get; set; }
        public string ZipCode { get; set; } = null!;
        public string Country { get; set; } = null!;
    }
}

using System.Collections.Generic;

namespace SHN_Gear.DTOs
{
    public class PaginatedResponseDto<T>
    {
        public IEnumerable<T> Data { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }
}

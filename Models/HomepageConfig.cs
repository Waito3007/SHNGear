using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SHN_Gear.Models
{
    public class HomepageConfig
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string ConfigJson { get; set; }

        public DateTime LastUpdated { get; set; }

        public string? UpdatedBy { get; set; }
    }
}

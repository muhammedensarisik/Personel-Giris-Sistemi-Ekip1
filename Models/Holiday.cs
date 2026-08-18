using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models 
{
    [Table("Holidays")]
    public class Holiday
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string? Name { get; set; } 

        [Required]
        public DateTime Date { get; set; } 

        [MaxLength(50)]
        public string? HolidayType { get; set; } 

        public bool IsHalfDay { get; set; } 

        // Panelden silinmesini engelleyen kilit
        public bool IsFixed { get; set; } 
    }
}
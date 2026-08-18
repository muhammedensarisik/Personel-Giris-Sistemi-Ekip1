using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("locations")]
    public class Location
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("location_name")]
        public string? LocationName { get; set; }

        [Column("qr_code_secret")]
        public string? QrCodeSecret { get; set; }

        [Column("latitude")]
        public double Latitude { get; set; }

        [Column("longitude")]
        public double Longitude { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("radius_meters")]
        public int RadiusMeters { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}

// Mobil tarama isteği için DTO sınıfı
public class QrScanDto
{
    public string UserId { get; set; } = string.Empty;
    public string QrData { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
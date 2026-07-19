public class Location {
    public int Id { get; set; }
    public string LocationName { get; set; }= string.Empty;
    public string QrCodeSecret { get; set; }= string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
}
namespace ArabaKiralama.Entities;

public class Car
{
    public int Id { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Plate { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public int SeatCount { get; set; }
    public int? Mileage { get; set; }
    public int CategoryId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CarCategory Category { get; set; } = null!;
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

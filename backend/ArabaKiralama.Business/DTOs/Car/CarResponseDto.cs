namespace ArabaKiralama.Business.DTOs.Car;

public class CarResponseDto
{
    public int Id { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Plate { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public bool IsAvailable { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public string Transmission { get; set; } = string.Empty;
    public int SeatCount { get; set; }
    public int? Mileage { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

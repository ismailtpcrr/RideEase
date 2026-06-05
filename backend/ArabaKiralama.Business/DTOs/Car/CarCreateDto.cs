using System.ComponentModel.DataAnnotations;

namespace ArabaKiralama.Business.DTOs.Car;

public class CarCreateDto
{
    [Required]
    [MaxLength(50)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Model { get; set; } = string.Empty;

    [Range(1900, 2030)]
    public int Year { get; set; }

    [Required]
    [MaxLength(15)]
    public string Plate { get; set; } = string.Empty;

    [Range(1, 500000)]
    public decimal DailyPrice { get; set; }

    public bool IsAvailable { get; set; } = true;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    [Url]
    public string? ImageUrl { get; set; }

    [Required]
    [MaxLength(20)]
    public string FuelType { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Transmission { get; set; } = string.Empty;

    [Range(2, 9)]
    public int SeatCount { get; set; }

    [Range(0, 2_000_000)]
    public int? Mileage { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}

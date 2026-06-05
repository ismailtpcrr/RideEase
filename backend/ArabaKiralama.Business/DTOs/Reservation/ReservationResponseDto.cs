using ArabaKiralama.Entities.Enums;

namespace ArabaKiralama.Business.DTOs.Reservation;

public class ReservationResponseDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public int CarId { get; set; }
    public string CarBrand { get; set; } = string.Empty;
    public string CarModel { get; set; } = string.Empty;
    public string CarPlate { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public ReservationStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

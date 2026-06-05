using ArabaKiralama.Entities.Enums;

namespace ArabaKiralama.Entities;

public class Reservation
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int CarId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal TotalPrice { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
    public Car Car { get; set; } = null!;
}

using System.ComponentModel.DataAnnotations;

namespace ArabaKiralama.Business.DTOs.Reservation;

public class ReservationCreateDto
{
    [Range(1, int.MaxValue)]
    public int CarId { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

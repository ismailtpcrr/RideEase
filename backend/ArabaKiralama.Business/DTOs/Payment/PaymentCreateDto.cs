using System.ComponentModel.DataAnnotations;

namespace ArabaKiralama.Business.DTOs.Payment;

public class PaymentCreateDto
{
    [Range(1, int.MaxValue)]
    public int ReservationId { get; set; }

    [Required]
    [MaxLength(20)]
    public string PaymentMethod { get; set; } = string.Empty;

    [MaxLength(4)]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "CardLastFour 4 haneli sayı olmalıdır.")]
    public string? CardLastFour { get; set; }
}

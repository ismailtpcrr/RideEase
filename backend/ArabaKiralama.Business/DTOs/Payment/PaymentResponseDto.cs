namespace ArabaKiralama.Business.DTOs.Payment;

public class PaymentResponseDto
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? CardLastFour { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CarBrand { get; set; } = string.Empty;
    public string CarModel { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
}

using ArabaKiralama.Business.DTOs.Payment;

namespace ArabaKiralama.Business.Abstract;

public interface IPaymentService
{
    Task<PaymentResponseDto> CreatePaymentAsync(string userId, PaymentCreateDto dto);
    Task<PaymentResponseDto?> GetByReservationAsync(int reservationId, string userId);
    Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync();
}

using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Payment;
using ArabaKiralama.Business.Exceptions;
using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.Entities;
using ArabaKiralama.Entities.Enums;

namespace ArabaKiralama.Business.Concrete;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IReservationRepository _reservationRepository;

    public PaymentService(IPaymentRepository paymentRepository, IReservationRepository reservationRepository)
    {
        _paymentRepository = paymentRepository;
        _reservationRepository = reservationRepository;
    }

    public async Task<PaymentResponseDto> CreatePaymentAsync(string userId, PaymentCreateDto dto)
    {
        var reservation = await _reservationRepository.GetByIdWithDetailsAsync(dto.ReservationId)
            ?? throw new BusinessException("Rezervasyon bulunamadı.");

        if (reservation.UserId != userId)
            throw new BusinessException("Bu rezervasyon size ait değil.");

        if (reservation.Status != ReservationStatus.Approved)
            throw new BusinessException("Sadece onaylanan rezervasyonlar için ödeme yapılabilir.");

        var existing = await _paymentRepository.GetByReservationIdAsync(dto.ReservationId);
        if (existing is not null && existing.Status == PaymentStatus.Completed)
            throw new BusinessException("Bu rezervasyon için ödeme zaten tamamlandı.");

        var payment = new Payment
        {
            ReservationId = dto.ReservationId,
            Amount = reservation.TotalPrice,
            PaymentMethod = dto.PaymentMethod,
            CardLastFour = dto.CardLastFour,
            Status = PaymentStatus.Completed,
            PaidAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment);
        await _paymentRepository.SaveAsync();

        return MapToResponse(payment, reservation);
    }

    public async Task<PaymentResponseDto?> GetByReservationAsync(int reservationId, string userId)
    {
        var payment = await _paymentRepository.GetByReservationIdAsync(reservationId);
        if (payment is null) return null;

        if (payment.Reservation.UserId != userId)
            throw new BusinessException("Bu ödemeye erişim yetkiniz yok.");

        return MapToResponse(payment, payment.Reservation);
    }

    public async Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync()
    {
        var payments = await _paymentRepository.GetAllWithDetailsAsync();
        return payments.Select(p => MapToResponse(p, p.Reservation));
    }

    private static PaymentResponseDto MapToResponse(Payment payment, Reservation reservation) => new()
    {
        Id = payment.Id,
        ReservationId = payment.ReservationId,
        Amount = payment.Amount,
        PaymentMethod = payment.PaymentMethod,
        CardLastFour = payment.CardLastFour,
        Status = payment.Status.ToString(),
        PaidAt = payment.PaidAt,
        CreatedAt = payment.CreatedAt,
        CarBrand = reservation.Car?.Brand ?? string.Empty,
        CarModel = reservation.Car?.Model ?? string.Empty,
        UserEmail = reservation.User?.Email ?? string.Empty
    };
}

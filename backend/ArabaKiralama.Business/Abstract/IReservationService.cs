using ArabaKiralama.Business.DTOs.Reservation;

namespace ArabaKiralama.Business.Abstract;

public interface IReservationService
{
    Task<ReservationResponseDto> CreateReservationAsync(string userId, ReservationCreateDto dto);
    Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(string userId);
    Task<IEnumerable<ReservationResponseDto>> GetAllReservationsAsync();
    Task CancelReservationAsync(int id, string userId);
    Task ApproveReservationAsync(int id);
    Task RejectReservationAsync(int id);
    Task CompleteReservationAsync(int id);
}

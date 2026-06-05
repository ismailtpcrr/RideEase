using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Reservation;
using ArabaKiralama.Business.Exceptions;
using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.Entities;
using ArabaKiralama.Entities.Enums;

namespace ArabaKiralama.Business.Concrete;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ICarRepository _carRepository;

    public ReservationService(IReservationRepository reservationRepository, ICarRepository carRepository)
    {
        _reservationRepository = reservationRepository;
        _carRepository = carRepository;
    }

    public async Task<ReservationResponseDto> CreateReservationAsync(string userId, ReservationCreateDto dto)
    {
        if (dto.StartDate >= dto.EndDate)
            throw new BusinessException("Başlangıç tarihi bitiş tarihinden önce olmalıdır.");

        if (dto.StartDate < DateOnly.FromDateTime(DateTime.Today))
            throw new BusinessException("Başlangıç tarihi bugünden önce olamaz.");

        var car = await _carRepository.GetByIdAsync(dto.CarId)
            ?? throw new BusinessException("Araç bulunamadı.");

        if (!car.IsAvailable)
            throw new BusinessException("Bu araç şu anda kiralamaya uygun değil.");

        var hasConflict = await _reservationRepository.HasConflictAsync(dto.CarId, dto.StartDate, dto.EndDate);
        if (hasConflict)
            throw new BusinessException("Seçilen tarih aralığında bu araç için aktif bir rezervasyon bulunmaktadır.");

        var days = dto.EndDate.DayNumber - dto.StartDate.DayNumber;
        var totalPrice = days * car.DailyPrice;

        var reservation = new Reservation
        {
            UserId = userId,
            CarId = dto.CarId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            TotalPrice = totalPrice,
            Notes = dto.Notes,
            Status = ReservationStatus.Pending
        };

        await _reservationRepository.AddAsync(reservation);
        await _reservationRepository.SaveAsync();

        var created = (await _reservationRepository.GetByIdWithDetailsAsync(reservation.Id))!;
        return MapToResponse(created);
    }

    public async Task<IEnumerable<ReservationResponseDto>> GetUserReservationsAsync(string userId)
    {
        var reservations = await _reservationRepository.GetByUserIdAsync(userId);
        return reservations.Select(MapToResponse);
    }

    public async Task<IEnumerable<ReservationResponseDto>> GetAllReservationsAsync()
    {
        var reservations = await _reservationRepository.GetAllWithDetailsAsync();
        return reservations.Select(MapToResponse);
    }

    public async Task CancelReservationAsync(int id, string userId)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new BusinessException("Rezervasyon bulunamadı.");

        if (reservation.UserId != userId)
            throw new BusinessException("Bu rezervasyonu iptal etme yetkiniz yok.");

        if (reservation.Status != ReservationStatus.Pending && reservation.Status != ReservationStatus.Approved)
            throw new BusinessException("Bu rezervasyon iptal edilemez.");

        reservation.Status = ReservationStatus.Cancelled;
        _reservationRepository.Update(reservation);
        await _reservationRepository.SaveAsync();
    }

    public async Task ApproveReservationAsync(int id)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new BusinessException("Rezervasyon bulunamadı.");

        if (reservation.Status != ReservationStatus.Pending)
            throw new BusinessException("Yalnızca bekleyen rezervasyonlar onaylanabilir.");

        reservation.Status = ReservationStatus.Approved;
        _reservationRepository.Update(reservation);
        await _reservationRepository.SaveAsync();
    }

    public async Task RejectReservationAsync(int id)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new BusinessException("Rezervasyon bulunamadı.");

        if (reservation.Status != ReservationStatus.Pending)
            throw new BusinessException("Yalnızca bekleyen rezervasyonlar reddedilebilir.");

        reservation.Status = ReservationStatus.Rejected;
        _reservationRepository.Update(reservation);
        await _reservationRepository.SaveAsync();
    }

    public async Task CompleteReservationAsync(int id)
    {
        var reservation = await _reservationRepository.GetByIdAsync(id)
            ?? throw new BusinessException("Rezervasyon bulunamadı.");

        if (reservation.Status != ReservationStatus.Approved)
            throw new BusinessException("Yalnızca onaylanmış rezervasyonlar tamamlanabilir.");

        reservation.Status = ReservationStatus.Completed;
        _reservationRepository.Update(reservation);
        await _reservationRepository.SaveAsync();
    }

    private static ReservationResponseDto MapToResponse(Reservation r) => new()
    {
        Id = r.Id,
        UserId = r.UserId,
        UserFullName = r.User is not null ? $"{r.User.FirstName} {r.User.LastName}" : string.Empty,
        CarId = r.CarId,
        CarBrand = r.Car?.Brand ?? string.Empty,
        CarModel = r.Car?.Model ?? string.Empty,
        CarPlate = r.Car?.Plate ?? string.Empty,
        StartDate = r.StartDate,
        EndDate = r.EndDate,
        TotalPrice = r.TotalPrice,
        Status = r.Status,
        Notes = r.Notes,
        CreatedAt = r.CreatedAt
    };
}

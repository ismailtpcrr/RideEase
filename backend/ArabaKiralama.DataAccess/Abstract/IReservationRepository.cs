using ArabaKiralama.Entities;

namespace ArabaKiralama.DataAccess.Abstract;

public interface IReservationRepository : IRepository<Reservation>
{
    Task<IEnumerable<Reservation>> GetByUserIdAsync(string userId);
    Task<IEnumerable<Reservation>> GetByCarIdAsync(int carId);
    Task<bool> HasConflictAsync(int carId, DateOnly startDate, DateOnly endDate, int? excludeReservationId = null);
    Task<IEnumerable<Reservation>> GetAllWithDetailsAsync();
    Task<Reservation?> GetByIdWithDetailsAsync(int id);
}

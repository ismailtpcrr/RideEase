using ArabaKiralama.Entities;

namespace ArabaKiralama.DataAccess.Abstract;

public interface IPaymentRepository : IRepository<Payment>
{
    Task<Payment?> GetByReservationIdAsync(int reservationId);
    Task<IEnumerable<Payment>> GetAllWithDetailsAsync();
}

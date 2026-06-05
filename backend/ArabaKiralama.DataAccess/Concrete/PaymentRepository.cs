using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArabaKiralama.DataAccess.Concrete;

public class PaymentRepository : Repository<Payment>, IPaymentRepository
{
    public PaymentRepository(AppDbContext context) : base(context) { }

    public async Task<Payment?> GetByReservationIdAsync(int reservationId)
        => await _context.Payments
            .Include(p => p.Reservation)
            .FirstOrDefaultAsync(p => p.ReservationId == reservationId);

    public async Task<IEnumerable<Payment>> GetAllWithDetailsAsync()
        => await _context.Payments
            .Include(p => p.Reservation)
            .ThenInclude(r => r.Car)
            .Include(p => p.Reservation)
            .ThenInclude(r => r.User)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
}

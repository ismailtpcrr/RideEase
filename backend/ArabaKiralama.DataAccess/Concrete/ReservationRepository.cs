using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;
using ArabaKiralama.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace ArabaKiralama.DataAccess.Concrete;

public class ReservationRepository : Repository<Reservation>, IReservationRepository
{
    public ReservationRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Reservation>> GetByUserIdAsync(string userId)
    {
        return await _context.Reservations
            .Include(r => r.Car).ThenInclude(c => c.Category)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Reservation>> GetByCarIdAsync(int carId)
    {
        return await _context.Reservations
            .Where(r => r.CarId == carId)
            .ToListAsync();
    }

    public async Task<bool> HasConflictAsync(int carId, DateOnly startDate, DateOnly endDate, int? excludeReservationId = null)
    {
        return await _context.Reservations.AnyAsync(r =>
            r.CarId == carId &&
            r.Id != excludeReservationId &&
            (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Approved) &&
            r.StartDate < endDate && r.EndDate > startDate);
    }

    public async Task<IEnumerable<Reservation>> GetAllWithDetailsAsync()
    {
        return await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Car).ThenInclude(c => c.Category)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Reservation?> GetByIdWithDetailsAsync(int id)
    {
        return await _context.Reservations
            .Include(r => r.User)
            .Include(r => r.Car).ThenInclude(c => c.Category)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}

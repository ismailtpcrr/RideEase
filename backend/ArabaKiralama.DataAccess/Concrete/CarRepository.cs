using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;
using ArabaKiralama.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace ArabaKiralama.DataAccess.Concrete;

public class CarRepository : Repository<Car>, ICarRepository
{
    public CarRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Car>> GetAvailableCarsAsync(DateOnly startDate, DateOnly endDate)
    {
        return await _context.Cars
            .Include(c => c.Category)
            .Where(c => c.IsAvailable && !c.Reservations.Any(r =>
                (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Approved) &&
                r.StartDate < endDate && r.EndDate > startDate))
            .ToListAsync();
    }

    public async Task<Car?> GetByIdWithCategoryAsync(int id)
    {
        return await _context.Cars
            .Include(c => c.Category)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Car>> GetAllWithCategoryAsync()
    {
        return await _context.Cars
            .Include(c => c.Category)
            .ToListAsync();
    }
}

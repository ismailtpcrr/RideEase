using ArabaKiralama.Entities;

namespace ArabaKiralama.DataAccess.Abstract;

public interface ICarRepository : IRepository<Car>
{
    Task<IEnumerable<Car>> GetAvailableCarsAsync(DateOnly startDate, DateOnly endDate);
    Task<Car?> GetByIdWithCategoryAsync(int id);
    Task<IEnumerable<Car>> GetAllWithCategoryAsync();
}

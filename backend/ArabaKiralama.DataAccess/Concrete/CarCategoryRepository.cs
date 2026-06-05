using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;

namespace ArabaKiralama.DataAccess.Concrete;

public class CarCategoryRepository : Repository<CarCategory>, ICarCategoryRepository
{
    public CarCategoryRepository(AppDbContext context) : base(context) { }
}

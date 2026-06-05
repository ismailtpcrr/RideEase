using ArabaKiralama.Entities;

namespace ArabaKiralama.DataAccess.Abstract;

public interface IUserLicenseRepository : IRepository<UserLicense>
{
    Task<UserLicense?> GetByUserIdAsync(string userId);
}

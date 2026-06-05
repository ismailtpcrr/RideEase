using ArabaKiralama.Entities;

namespace ArabaKiralama.DataAccess.Abstract;

public interface IRefreshTokenRepository : IRepository<RefreshToken>
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task RevokeAllForUserAsync(string userId);
}

using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArabaKiralama.DataAccess.Concrete;

public class RefreshTokenRepository : Repository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(AppDbContext context) : base(context) { }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
        => await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == token);

    public async Task RevokeAllForUserAsync(string userId)
    {
        var tokens = await _context.RefreshTokens
            .Where(r => r.UserId == userId && !r.IsRevoked)
            .ToListAsync();

        foreach (var t in tokens)
            t.IsRevoked = true;
    }
}

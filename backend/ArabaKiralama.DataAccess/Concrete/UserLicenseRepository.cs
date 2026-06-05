using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArabaKiralama.DataAccess.Concrete;

public class UserLicenseRepository : Repository<UserLicense>, IUserLicenseRepository
{
    public UserLicenseRepository(AppDbContext context) : base(context) { }

    public async Task<UserLicense?> GetByUserIdAsync(string userId)
    {
        return await _context.UserLicenses
            .FirstOrDefaultAsync(l => l.UserId == userId);
    }
}

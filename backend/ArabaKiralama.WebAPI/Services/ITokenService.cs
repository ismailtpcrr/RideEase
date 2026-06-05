using System.Security.Claims;
using ArabaKiralama.Entities;

namespace ArabaKiralama.WebAPI.Services;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user, string role, IEnumerable<Claim> extraClaims, out DateTime expiresAt);
    string GenerateRefreshToken();
}

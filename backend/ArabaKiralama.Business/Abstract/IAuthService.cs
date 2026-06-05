using System.Security.Claims;
using ArabaKiralama.Business.DTOs.Auth;
using ArabaKiralama.Entities;

namespace ArabaKiralama.Business.Abstract;

public interface IAuthService
{
    Task<ApplicationUser> RegisterAsync(RegisterDto dto);
    Task<(ApplicationUser User, string Role, IList<Claim> Claims)> LoginAsync(LoginDto dto);
    Task<string> GenerateEmailConfirmationTokenAsync(string userId);
    Task ConfirmEmailAsync(string userId, string token);
    Task<(ApplicationUser User, string Token)> GetUserForResendAsync(string email);
    Task<string> GetUserRoleAsync(string userId);
    Task<IList<Claim>> GetUserClaimsAsync(string userId);
    Task<(ApplicationUser User, string Token)> GenerateForgotPasswordTokenAsync(string email);
    Task ResetPasswordAsync(string email, string token, string newPassword);
}

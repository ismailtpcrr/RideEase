using System.Security.Claims;
using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Auth;
using ArabaKiralama.Business.Exceptions;
using ArabaKiralama.Entities;
using Microsoft.AspNetCore.Identity;

namespace ArabaKiralama.Business.Concrete;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<ApplicationUser> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            throw new BusinessException("Bu e-posta adresi zaten kayıtlı.");

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            BirthDate = dto.BirthDate,
            Address = dto.Address
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new BusinessException(string.Join(", ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, "Customer");
        return user;
    }

    public async Task<(ApplicationUser User, string Role, IList<Claim> Claims)> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email)
            ?? throw new BusinessException("E-posta veya şifre hatalı.");

        if (await _userManager.IsLockedOutAsync(user))
            throw new BusinessException("Hesabınız geçici olarak kilitlendi. Lütfen 15 dakika sonra tekrar deneyin.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
        {
            await _userManager.AccessFailedAsync(user);
            throw new BusinessException("E-posta veya şifre hatalı.");
        }

        if (!await _userManager.IsEmailConfirmedAsync(user))
            throw new BusinessException("E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin.");

        await _userManager.ResetAccessFailedCountAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Customer";
        var claims = await _userManager.GetClaimsAsync(user);

        return (user, role, claims);
    }

    public async Task<IList<Claim>> GetUserClaimsAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");
        return await _userManager.GetClaimsAsync(user);
    }

    public async Task<string> GenerateEmailConfirmationTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");
        return await _userManager.GenerateEmailConfirmationTokenAsync(user);
    }

    public async Task ConfirmEmailAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
            throw new BusinessException("Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
    }

    public async Task<string> GetUserRoleAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");
        var roles = await _userManager.GetRolesAsync(user);
        return roles.FirstOrDefault() ?? "Customer";
    }

    public async Task<(ApplicationUser User, string Token)> GetUserForResendAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email)
            ?? throw new BusinessException("Bu e-posta adresiyle kayıtlı hesap bulunamadı.");

        if (await _userManager.IsEmailConfirmedAsync(user))
            throw new BusinessException("Bu hesabın e-postası zaten doğrulanmış.");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        return (user, token);
    }

    public async Task<(ApplicationUser User, string Token)> GenerateForgotPasswordTokenAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email)
            ?? throw new BusinessException("Bu e-posta adresiyle kayıtlı hesap bulunamadı.");

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        return (user, token);
    }

    public async Task ResetPasswordAsync(string email, string token, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
            throw new BusinessException(result.Errors.FirstOrDefault()?.Description ?? "Şifre sıfırlanamadı.");
    }
}

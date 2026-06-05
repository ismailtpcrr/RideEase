using System.Security.Claims;
using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.User;
using ArabaKiralama.Business.Exceptions;
using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.Entities;
using Microsoft.AspNetCore.Identity;

namespace ArabaKiralama.Business.Concrete;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserLicenseRepository _licenseRepository;

    public UserService(UserManager<ApplicationUser> userManager, IUserLicenseRepository licenseRepository)
    {
        _userManager = userManager;
        _licenseRepository = licenseRepository;
    }

    public async Task<UserProfileDto?> GetProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return null;

        var license = await _licenseRepository.GetByUserIdAsync(userId);
        return MapToProfileDto(user, license);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(string userId, UserProfileUpdateDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.PhoneNumber = dto.PhoneNumber;
        user.Address = dto.Address;

        await _userManager.UpdateAsync(user);

        var license = await _licenseRepository.GetByUserIdAsync(userId);
        return MapToProfileDto(user, license);
    }

    public async Task<LicenseDto> AddLicenseAsync(string userId, AddLicenseDto dto)
    {
        var existing = await _licenseRepository.GetByUserIdAsync(userId);
        if (existing is not null)
            throw new BusinessException("Bu kullanıcının zaten bir ehliyet kaydı var. Güncelleme için UpdateLicense kullanın.");

        var license = new UserLicense
        {
            UserId = userId,
            LicenseNumber = dto.LicenseNumber,
            LicenseClass = dto.LicenseClass,
            ExpiryDate = dto.ExpiryDate,
            IsVerified = false
        };

        await _licenseRepository.AddAsync(license);
        await _licenseRepository.SaveAsync();

        return MapToLicenseDto(license);
    }

    public async Task<LicenseDto> UpdateLicenseAsync(string userId, AddLicenseDto dto)
    {
        var license = await _licenseRepository.GetByUserIdAsync(userId)
            ?? throw new BusinessException("Ehliyet kaydı bulunamadı.");

        license.LicenseNumber = dto.LicenseNumber;
        license.LicenseClass = dto.LicenseClass;
        license.ExpiryDate = dto.ExpiryDate;
        license.IsVerified = false;

        _licenseRepository.Update(license);
        await _licenseRepository.SaveAsync();

        return MapToLicenseDto(license);
    }

    public async Task VerifyLicenseAsync(int licenseId)
    {
        var license = await _licenseRepository.GetByIdAsync(licenseId)
            ?? throw new BusinessException("Ehliyet kaydı bulunamadı.");

        license.IsVerified = true;
        _licenseRepository.Update(license);
        await _licenseRepository.SaveAsync();
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
            throw new BusinessException(result.Errors.FirstOrDefault()?.Description ?? "Şifre değiştirilemedi.");
    }

    public async Task<IEnumerable<UserListDto>> GetAllUsersAsync()
    {
        var users = _userManager.Users.ToList();
        var result = new List<UserListDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var claims = await _userManager.GetClaimsAsync(user);
            result.Add(new UserListDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = roles.FirstOrDefault() ?? "Customer",
                CreatedAt = user.CreatedAt,
                IsLocked = user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow,
                Claims = claims.ToDictionary(c => c.Type, c => c.Value)
            });
        }

        return result;
    }

    public async Task AssignRoleAsync(string userId, string role)
    {
        var validRoles = new[] { "Admin", "Moderator", "CarManager", "Customer" };
        if (!validRoles.Contains(role))
            throw new BusinessException("Geçersiz rol.");

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        await _userManager.AddToRoleAsync(user, role);
    }

    public async Task AddClaimAsync(string userId, string claimType, string claimValue)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        var existing = (await _userManager.GetClaimsAsync(user))
            .FirstOrDefault(c => c.Type == claimType);
        if (existing is not null)
            await _userManager.RemoveClaimAsync(user, existing);

        await _userManager.AddClaimAsync(user, new Claim(claimType, claimValue));
    }

    public async Task RemoveClaimAsync(string userId, string claimType)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        var existing = (await _userManager.GetClaimsAsync(user))
            .FirstOrDefault(c => c.Type == claimType);
        if (existing is not null)
            await _userManager.RemoveClaimAsync(user, existing);
    }

    public async Task DeactivateUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        await _userManager.SetLockoutEnabledAsync(user, true);
        await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.Parse("2099-12-31"));
    }

    public async Task ActivateUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Kullanıcı bulunamadı.");

        await _userManager.SetLockoutEndDateAsync(user, null);
    }

    private static UserProfileDto MapToProfileDto(ApplicationUser user, UserLicense? license) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email!,
        PhoneNumber = user.PhoneNumber,
        BirthDate = user.BirthDate,
        Address = user.Address,
        CreatedAt = user.CreatedAt,
        License = license is null ? null : MapToLicenseDto(license)
    };

    private static LicenseDto MapToLicenseDto(UserLicense license) => new()
    {
        Id = license.Id,
        LicenseNumber = license.LicenseNumber,
        LicenseClass = license.LicenseClass,
        ExpiryDate = license.ExpiryDate,
        IsVerified = license.IsVerified
    };
}

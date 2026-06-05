using ArabaKiralama.Business.DTOs.User;

namespace ArabaKiralama.Business.Abstract;

public interface IUserService
{
    Task<UserProfileDto?> GetProfileAsync(string userId);
    Task<UserProfileDto> UpdateProfileAsync(string userId, UserProfileUpdateDto dto);
    Task<LicenseDto> AddLicenseAsync(string userId, AddLicenseDto dto);
    Task<LicenseDto> UpdateLicenseAsync(string userId, AddLicenseDto dto);
    Task VerifyLicenseAsync(int licenseId);
    Task ChangePasswordAsync(string userId, ChangePasswordDto dto);
    Task<IEnumerable<UserListDto>> GetAllUsersAsync();
    Task DeactivateUserAsync(string userId);
    Task ActivateUserAsync(string userId);
    Task AssignRoleAsync(string userId, string role);
    Task AddClaimAsync(string userId, string claimType, string claimValue);
    Task RemoveClaimAsync(string userId, string claimType);
}

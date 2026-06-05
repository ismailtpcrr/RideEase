using ArabaKiralama.Entities.Enums;

namespace ArabaKiralama.Business.DTOs.User;

public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateOnly BirthDate { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; }
    public LicenseDto? License { get; set; }
}

public class LicenseDto
{
    public int Id { get; set; }
    public string LicenseNumber { get; set; } = string.Empty;
    public LicenseClass LicenseClass { get; set; }
    public DateOnly ExpiryDate { get; set; }
    public bool IsVerified { get; set; }
}

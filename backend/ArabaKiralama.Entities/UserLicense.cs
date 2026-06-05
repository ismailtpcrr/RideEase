using ArabaKiralama.Entities.Enums;

namespace ArabaKiralama.Entities;

public class UserLicense
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public LicenseClass LicenseClass { get; set; }
    public DateOnly ExpiryDate { get; set; }
    public bool IsVerified { get; set; } = false;

    public ApplicationUser User { get; set; } = null!;
}

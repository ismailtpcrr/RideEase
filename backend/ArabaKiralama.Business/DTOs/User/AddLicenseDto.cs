using System.ComponentModel.DataAnnotations;
using ArabaKiralama.Entities.Enums;

namespace ArabaKiralama.Business.DTOs.User;

public class AddLicenseDto
{
    [Required]
    [MaxLength(20)]
    public string LicenseNumber { get; set; } = string.Empty;

    [Required]
    public LicenseClass LicenseClass { get; set; }

    [Required]
    public DateOnly ExpiryDate { get; set; }
}

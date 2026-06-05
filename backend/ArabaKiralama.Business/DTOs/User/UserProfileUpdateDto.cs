using System.ComponentModel.DataAnnotations;

namespace ArabaKiralama.Business.DTOs.User;

public class UserProfileUpdateDto
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Phone]
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }
}

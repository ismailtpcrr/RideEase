using System.ComponentModel.DataAnnotations;

namespace ArabaKiralama.Business.DTOs.Auth;

public class RegisterDto
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public DateOnly BirthDate { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }
}

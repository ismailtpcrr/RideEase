using System.ComponentModel.DataAnnotations;

namespace ArabaKiralama.Business.DTOs.Auth;

public class LoginDto
{
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}

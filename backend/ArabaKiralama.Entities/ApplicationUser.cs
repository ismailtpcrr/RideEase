using Microsoft.AspNetCore.Identity;

namespace ArabaKiralama.Entities;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserLicense? License { get; set; }
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}

namespace ArabaKiralama.Business.DTOs.User;

public class UserListDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsLocked { get; set; }
    public Dictionary<string, string> Claims { get; set; } = new();
}

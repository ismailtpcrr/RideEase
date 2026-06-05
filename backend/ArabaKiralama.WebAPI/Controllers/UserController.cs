using System.Security.Claims;
using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArabaKiralama.WebAPI.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var profile = await _userService.GetProfileAsync(userId);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserProfileUpdateDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var profile = await _userService.UpdateProfileAsync(userId, dto);
        return Ok(profile);
    }

    [HttpPost("license")]
    public async Task<IActionResult> AddLicense([FromBody] AddLicenseDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var license = await _userService.AddLicenseAsync(userId, dto);
        return Ok(license);
    }

    [HttpPut("license")]
    public async Task<IActionResult> UpdateLicense([FromBody] AddLicenseDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var license = await _userService.UpdateLicenseAsync(userId, dto);
        return Ok(license);
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _userService.ChangePasswordAsync(userId, dto);
        return NoContent();
    }
}

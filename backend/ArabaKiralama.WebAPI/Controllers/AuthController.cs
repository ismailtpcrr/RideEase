using System.ComponentModel.DataAnnotations;
using System.Net;
using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Auth;
using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.Entities;
using ArabaKiralama.WebAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ArabaKiralama.WebAPI.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IConfiguration _configuration;

    public AuthController(
        IAuthService authService,
        ITokenService tokenService,
        IEmailService emailService,
        IRefreshTokenRepository refreshTokenRepository,
        IConfiguration configuration)
    {
        _authService = authService;
        _tokenService = tokenService;
        _emailService = emailService;
        _refreshTokenRepository = refreshTokenRepository;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var user = await _authService.RegisterAsync(dto);

        // Email doğrulama linki oluştur ve gönder
        var token = await _authService.GenerateEmailConfirmationTokenAsync(user.Id);
        var encodedToken = WebUtility.UrlEncode(token);
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var confirmUrl = $"{frontendUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

        await _emailService.SendEmailConfirmationAsync(user.Email!, user.FirstName, confirmUrl);

        return Ok(new { message = "Kayıt başarılı. E-posta adresinize doğrulama linki gönderildi." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var (user, role, userClaims) = await _authService.LoginAsync(dto);

        var accessToken = _tokenService.GenerateAccessToken(user, role, userClaims, out var expiresAt);
        var refreshTokenValue = _tokenService.GenerateRefreshToken();

        var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        var refreshToken = new RefreshToken
        {
            Token = refreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays)
        };

        await _refreshTokenRepository.AddAsync(refreshToken);
        await _refreshTokenRepository.SaveAsync();

        return Ok(new AuthResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshTokenValue,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
            ExpiresAt = expiresAt,
            Claims = userClaims.ToDictionary(c => c.Type, c => c.Value)
        });
    }

    [HttpPost("refresh")]
    [EnableRateLimiting("global")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto dto)
    {
        var stored = await _refreshTokenRepository.GetByTokenAsync(dto.RefreshToken);

        if (stored is null || stored.IsRevoked || stored.ExpiresAt <= DateTime.UtcNow || stored.User is null)
            return Unauthorized(new { message = "Geçersiz veya süresi dolmuş refresh token." });

        // Eski token'ı iptal et, yeni token üret
        stored.IsRevoked = true;
        _refreshTokenRepository.Update(stored);

        var role = await _authService.GetUserRoleAsync(stored.UserId);
        var userClaims = await _authService.GetUserClaimsAsync(stored.UserId);
        var newAccessToken = _tokenService.GenerateAccessToken(stored.User, role, userClaims, out var expiresAt);
        var newRefreshTokenValue = _tokenService.GenerateRefreshToken();

        var expiryDays = int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"] ?? "7");
        var newRefreshToken = new RefreshToken
        {
            Token = newRefreshTokenValue,
            UserId = stored.UserId,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays)
        };

        await _refreshTokenRepository.AddAsync(newRefreshToken);
        await _refreshTokenRepository.SaveAsync();

        return Ok(new { token = newAccessToken, refreshToken = newRefreshTokenValue, expiresAt });
    }

    [HttpPost("logout")]
    [EnableRateLimiting("global")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequestDto dto)
    {
        var stored = await _refreshTokenRepository.GetByTokenAsync(dto.RefreshToken);
        if (stored is not null && !stored.IsRevoked)
        {
            stored.IsRevoked = true;
            _refreshTokenRepository.Update(stored);
            await _refreshTokenRepository.SaveAsync();
        }
        return NoContent();
    }

    [HttpGet("confirm-email")]
    [EnableRateLimiting("global")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        await _authService.ConfirmEmailAsync(userId, token);
        return Ok(new { message = "E-posta adresiniz başarıyla doğrulandı." });
    }

    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmationDto dto)
    {
        var (user, token) = await _authService.GetUserForResendAsync(dto.Email);
        var encodedToken = WebUtility.UrlEncode(token);
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
        var confirmUrl = $"{frontendUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

        await _emailService.SendEmailConfirmationAsync(user.Email!, user.FirstName, confirmUrl);
        return Ok(new { message = "Doğrulama e-postası tekrar gönderildi." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        // Email enumeration'ı önlemek için her durumda aynı mesaj döner
        try
        {
            var (user, token) = await _authService.GenerateForgotPasswordTokenAsync(dto.Email);
            var encodedToken = WebUtility.UrlEncode(token);
            var encodedEmail = WebUtility.UrlEncode(dto.Email);
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var resetUrl = $"{frontendUrl}/reset-password?email={encodedEmail}&token={encodedToken}";
            await _emailService.SendPasswordResetAsync(user.Email!, user.FirstName, resetUrl);
        }
        catch
        {
            // Hata gizlenir — kayıtlı olmayan e-postalar tespit edilemesin
        }

        return Ok(new { message = "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        await _authService.ResetPasswordAsync(dto.Email, dto.Token, dto.NewPassword);
        return Ok(new { message = "Şifreniz başarıyla sıfırlandı." });
    }
}

public class RefreshRequestDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class ResendConfirmationDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ForgotPasswordDto
{
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string NewPassword { get; set; } = string.Empty;
}

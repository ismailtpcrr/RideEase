using System.Net;
using System.Net.Mail;

namespace ArabaKiralama.WebAPI.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailConfirmationAsync(string toEmail, string firstName, string confirmationUrl)
    {
        var mode = _configuration["Email:Mode"] ?? "Console";

        if (mode == "Console")
        {
            // Geliştirme modunda linki konsola yaz
            _logger.LogWarning(
                """

                ==========================================
                 EMAIL DOĞRULAMA LİNKİ (Geliştirme Modu)
                 Kullanıcı : {Email}
                 Link      : {Url}
                ==========================================
                """,
                toEmail, confirmationUrl);
            return;
        }

        var host = _configuration["Email:Host"]!;
        var port = int.Parse(_configuration["Email:Port"] ?? "587");
        var username = _configuration["Email:Username"]!;
        var password = _configuration["Email:Password"]!;
        var from = _configuration["Email:From"]!;

        var body = $"""
            <html><body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#1e293b">Merhaba, {firstName}!</h2>
              <p style="color:#475569">Hesabınızı doğrulamak için aşağıdaki butona tıklayın.</p>
              <a href="{confirmationUrl}"
                 style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;
                        border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
                E-postamı Doğrula
              </a>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                Bu link 24 saat geçerlidir. Eğer siz kayıt olmadıysanız bu e-postayı görmezden gelin.
              </p>
            </body></html>
            """;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true")
        };

        var message = new MailMessage(from, toEmail, "E-posta Adresinizi Doğrulayın", body)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(message);
    }

    public async Task SendPasswordResetAsync(string toEmail, string firstName, string resetUrl)
    {
        var mode = _configuration["Email:Mode"] ?? "Console";

        if (mode == "Console")
        {
            _logger.LogWarning(
                """

                ==========================================
                 ŞİFRE SIFIRLAMA LİNKİ (Geliştirme Modu)
                 Kullanıcı : {Email}
                 Link      : {Url}
                ==========================================
                """,
                toEmail, resetUrl);
            return;
        }

        var host = _configuration["Email:Host"]!;
        var port = int.Parse(_configuration["Email:Port"] ?? "587");
        var username = _configuration["Email:Username"]!;
        var password = _configuration["Email:Password"]!;
        var from = _configuration["Email:From"]!;

        var body = $"""
            <html><body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#1e293b">Şifre Sıfırlama</h2>
              <p style="color:#475569">Merhaba {firstName}, şifrenizi sıfırlamak için aşağıdaki butona tıklayın.</p>
              <a href="{resetUrl}"
                 style="display:inline-block;background:#f97316;color:#fff;padding:12px 24px;
                        border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
                Şifremi Sıfırla
              </a>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px">
                Bu link 1 saat geçerlidir. Eğer siz talep etmediyseniz bu e-postayı görmezden gelin.
              </p>
            </body></html>
            """;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true")
        };

        var message = new MailMessage(from, toEmail, "Şifre Sıfırlama Talebi", body)
        {
            IsBodyHtml = true
        };

        await client.SendMailAsync(message);
    }
}

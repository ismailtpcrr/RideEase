namespace ArabaKiralama.WebAPI.Services;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string toEmail, string firstName, string confirmationUrl);
    Task SendPasswordResetAsync(string toEmail, string firstName, string resetUrl);
}

using System.Threading.RateLimiting;
using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.Concrete;
using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.DataAccess.Concrete;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;
using ArabaKiralama.WebAPI.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ArabaKiralama.WebAPI.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 6;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.User.RequireUniqueEmail = true;

            // 5 yanlış denemede 15 dk hesap kilidi
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.AllowedForNewUsers = true;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        // Repositories
        services.AddScoped<ICarRepository, CarRepository>();
        services.AddScoped<ICarCategoryRepository, CarCategoryRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<IUserLicenseRepository, UserLicenseRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        // Business services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICarService, CarService>();
        services.AddScoped<IReservationService, ReservationService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IPaymentService, PaymentService>();

        // WebAPI services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IEmailService, EmailService>();

        // Yetkilendirme policy'leri
        services.AddAuthorization(options =>
        {
            // Admin VEYA (CarManager + can_delete_car claim'i) araç silebilir
            options.AddPolicy("CanDeleteCar", policy =>
                policy.RequireAssertion(ctx =>
                    ctx.User.IsInRole("Admin") ||
                    (ctx.User.IsInRole("CarManager") &&
                     ctx.User.HasClaim("can_delete_car", "true"))));
        });

        // Rate limiting
        services.AddRateLimiter(options =>
        {
            // Auth endpoint'leri: IP başına dakikada 10 istek
            options.AddPolicy("auth", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));

            // Genel API: IP başına dakikada 100 istek
            options.AddPolicy("global", context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));

            options.RejectionStatusCode = 429;
        });

        return services;
    }
}

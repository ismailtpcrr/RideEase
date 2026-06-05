using System.Security.Claims;
using ArabaKiralama.DataAccess.Context;
using ArabaKiralama.Entities;
using ArabaKiralama.WebAPI.Extensions;
using ArabaKiralama.WebAPI.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(
                builder.Configuration["AllowedOrigins"] ?? "http://localhost:3000"
              )
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Veritabanı bağlantısını kontrol et
// Migration'lar postgres superuser ile ayrıca uygulanır (arabakiralama_app DDL yetkisine sahip değil)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.CanConnect();

    // Test kullanıcılarını seed et (sadece development ortamında, kullanıcı yoksa oluştur)
    if (app.Environment.IsDevelopment())
    {
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        var seedUsers = new[]
        {
            new { Email = "admin@araba.com",       FirstName = "Admin",    LastName = "User",     Role = "Admin",      Password = "Admin123!", Claim = (string?)null },
            new { Email = "moderator@araba.com",   FirstName = "Moderatör", LastName = "Kullanıcı", Role = "Moderator", Password = "Mod123!",   Claim = (string?)null },
            new { Email = "carmanager@araba.com",  FirstName = "Araç",    LastName = "Şefi",     Role = "CarManager", Password = "Car123!",   Claim = "can_delete_car" },
            new { Email = "employee@araba.com",    FirstName = "Araç",    LastName = "Çalışanı", Role = "CarManager", Password = "Emp123!",   Claim = (string?)null },
            new { Email = "musteri@araba.com",     FirstName = "Test",    LastName = "Müşteri",  Role = "Customer",   Password = "Musteri123!", Claim = (string?)null },
        };

        foreach (var s in seedUsers)
        {
            if (await userManager.FindByEmailAsync(s.Email) is not null) continue;

            var user = new ApplicationUser
            {
                UserName = s.Email,
                Email = s.Email,
                FirstName = s.FirstName,
                LastName = s.LastName,
                EmailConfirmed = true
            };

            await userManager.CreateAsync(user, s.Password);
            await userManager.AddToRoleAsync(user, s.Role);

            if (s.Claim is not null)
                await userManager.AddClaimAsync(user, new Claim(s.Claim, "true"));
        }
    }
}

// HTTPS yönlendirmesi
app.UseHttpsRedirection();

// Araç görsellerini /uploads altında statik olarak sun
app.UseStaticFiles();

// Güvenlik header'ları — her yanıta eklenir
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    await next();
});

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

using ArabaKiralama.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ArabaKiralama.DataAccess.Context;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Car> Cars => Set<Car>();
    public DbSet<CarCategory> CarCategories => Set<CarCategory>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<UserLicense> UserLicenses => Set<UserLicense>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Car>(e =>
        {
            e.HasIndex(c => c.Plate).IsUnique();
            e.Property(c => c.DailyPrice).HasColumnType("decimal(10,2)");
        });

        builder.Entity<Reservation>(e =>
        {
            e.Property(r => r.TotalPrice).HasColumnType("decimal(10,2)");
            e.HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Car)
                .WithMany(c => c.Reservations)
                .HasForeignKey(r => r.CarId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<UserLicense>(e =>
        {
            e.HasOne(l => l.User)
                .WithOne(u => u.License)
                .HasForeignKey<UserLicense>(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<RefreshToken>(e =>
        {
            e.HasIndex(r => r.Token).IsUnique();
            e.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Payment>(e =>
        {
            e.Property(p => p.Amount).HasColumnType("decimal(10,2)");
            e.HasOne(p => p.Reservation)
                .WithOne()
                .HasForeignKey<Payment>(p => p.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Rol seed
        var adminRoleId = "a1b2c3d4-0001-0001-0001-000000000001";
        var customerRoleId = "a1b2c3d4-0002-0002-0002-000000000002";
        var moderatorRoleId = "a1b2c3d4-0003-0003-0003-000000000003";
        var carManagerRoleId = "a1b2c3d4-0004-0004-0004-000000000004";

        builder.Entity<IdentityRole>().HasData(
            new IdentityRole { Id = adminRoleId, Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Id = customerRoleId, Name = "Customer", NormalizedName = "CUSTOMER" },
            new IdentityRole { Id = moderatorRoleId, Name = "Moderator", NormalizedName = "MODERATOR" },
            new IdentityRole { Id = carManagerRoleId, Name = "CarManager", NormalizedName = "CARMANAGER" }
        );

        // CarCategory seed
        builder.Entity<CarCategory>().HasData(
            new CarCategory { Id = 1, Name = "Sedan" },
            new CarCategory { Id = 2, Name = "SUV" },
            new CarCategory { Id = 3, Name = "Minivan" },
            new CarCategory { Id = 4, Name = "Ticari" },
            new CarCategory { Id = 5, Name = "Lüks" }
        );
    }
}

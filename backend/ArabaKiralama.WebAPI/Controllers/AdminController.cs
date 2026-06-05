using ArabaKiralama.Business.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArabaKiralama.WebAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IReservationService _reservationService;
    private readonly ICarService _carService;
    private readonly IUserService _userService;
    private readonly IPaymentService _paymentService;

    public AdminController(IReservationService reservationService, ICarService carService, IUserService userService, IPaymentService paymentService)
    {
        _reservationService = reservationService;
        _carService = carService;
        _userService = userService;
        _paymentService = paymentService;
    }

    [HttpGet("reservations")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> GetAllReservations()
    {
        var reservations = await _reservationService.GetAllReservationsAsync();
        return Ok(reservations);
    }

    [HttpPut("reservations/{id}/approve")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Approve(int id)
    {
        await _reservationService.ApproveReservationAsync(id);
        return NoContent();
    }

    [HttpPut("reservations/{id}/reject")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Reject(int id)
    {
        await _reservationService.RejectReservationAsync(id);
        return NoContent();
    }

    [HttpPut("reservations/{id}/complete")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> Complete(int id)
    {
        await _reservationService.CompleteReservationAsync(id);
        return NoContent();
    }

    [HttpPut("licenses/{id}/verify")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> VerifyLicense(int id)
    {
        await _userService.VerifyLicenseAsync(id);
        return NoContent();
    }

    [HttpGet("users")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPut("users/{id}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateUser(string id)
    {
        await _userService.DeactivateUserAsync(id);
        return NoContent();
    }

    [HttpPut("users/{id}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateUser(string id)
    {
        await _userService.ActivateUserAsync(id);
        return NoContent();
    }

    [HttpPut("users/{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignRole(string id, [FromBody] AssignRoleRequest request)
    {
        await _userService.AssignRoleAsync(id, request.Role);
        return NoContent();
    }

    [HttpPut("users/{id}/claims/add")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddClaim(string id, [FromBody] ManageClaimRequest request)
    {
        await _userService.AddClaimAsync(id, request.ClaimType, request.ClaimValue);
        return NoContent();
    }

    [HttpPut("users/{id}/claims/remove")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveClaim(string id, [FromBody] RemoveClaimRequest request)
    {
        await _userService.RemoveClaimAsync(id, request.ClaimType);
        return NoContent();
    }

    [HttpGet("payments")]
    [Authorize(Roles = "Admin,Moderator")]
    public async Task<IActionResult> GetAllPayments()
    {
        var payments = await _paymentService.GetAllPaymentsAsync();
        return Ok(payments);
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin,Moderator,CarManager")]
    public async Task<IActionResult> GetStats()
    {
        var reservations = (await _reservationService.GetAllReservationsAsync()).ToList();
        var cars = (await _carService.GetAllCarsAsync()).ToList();

        return Ok(new
        {
            totalCars = cars.Count,
            availableCars = cars.Count(c => c.IsAvailable),
            totalReservations = reservations.Count,
            pendingReservations = reservations.Count(r => r.Status == Entities.Enums.ReservationStatus.Pending),
            approvedReservations = reservations.Count(r => r.Status == Entities.Enums.ReservationStatus.Approved),
            totalRevenue = reservations
                .Where(r => r.Status == Entities.Enums.ReservationStatus.Completed)
                .Sum(r => r.TotalPrice)
        });
    }
}

public record AssignRoleRequest(string Role);
public record ManageClaimRequest(string ClaimType, string ClaimValue);
public record RemoveClaimRequest(string ClaimType);

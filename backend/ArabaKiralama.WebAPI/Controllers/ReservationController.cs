using System.Security.Claims;
using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Reservation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArabaKiralama.WebAPI.Controllers;

[ApiController]
[Route("api/reservations")]
[Authorize]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] ReservationCreateDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var reservation = await _reservationService.CreateReservationAsync(userId, dto);
        return CreatedAtAction(nameof(GetMyReservations), reservation);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyReservations()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var reservations = await _reservationService.GetUserReservationsAsync(userId);
        return Ok(reservations);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await _reservationService.CancelReservationAsync(id, userId);
        return NoContent();
    }
}

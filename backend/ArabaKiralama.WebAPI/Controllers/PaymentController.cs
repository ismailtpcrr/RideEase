using System.Security.Claims;
using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Payment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArabaKiralama.WebAPI.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] PaymentCreateDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _paymentService.CreatePaymentAsync(userId, dto);
        return Ok(result);
    }

    [HttpGet("reservation/{reservationId}")]
    public async Task<IActionResult> GetByReservation(int reservationId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _paymentService.GetByReservationAsync(reservationId, userId);
        return result is null ? NotFound() : Ok(result);
    }
}

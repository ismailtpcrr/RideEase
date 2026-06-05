using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Car;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArabaKiralama.WebAPI.Controllers;

[ApiController]
[Route("api/cars")]
public class CarController : ControllerBase
{
    private readonly ICarService _carService;

    public CarController(ICarService carService)
    {
        _carService = carService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cars = await _carService.GetAllCarsAsync();
        return Ok(cars);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var car = await _carService.GetCarByIdAsync(id);
        return car is null ? NotFound() : Ok(car);
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable([FromQuery] DateOnly start, [FromQuery] DateOnly end)
    {
        var cars = await _carService.GetAvailableCarsAsync(start, end);
        return Ok(cars);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,CarManager")]
    public async Task<IActionResult> Create([FromBody] CarCreateDto dto)
    {
        var car = await _carService.CreateCarAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = car.Id }, car);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,CarManager")]
    public async Task<IActionResult> Update(int id, [FromBody] CarUpdateDto dto)
    {
        var car = await _carService.UpdateCarAsync(id, dto);
        return Ok(car);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "CanDeleteCar")]
    public async Task<IActionResult> Delete(int id)
    {
        await _carService.DeleteCarAsync(id);
        return NoContent();
    }

    [HttpPatch("{id}/availability")]
    [Authorize(Roles = "Admin,CarManager")]
    public async Task<IActionResult> SetAvailability(int id, [FromBody] SetAvailabilityRequest request)
    {
        await _carService.SetAvailabilityAsync(id, request.IsAvailable);
        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _carService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost("upload-image")]
    [Authorize(Roles = "Admin,CarManager")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { message = "Sadece .jpg, .jpeg, .png, .webp dosyaları kabul edilir." });

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "Dosya boyutu 5MB'ı aşamaz." });

        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "cars");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        return Ok(new { imageUrl = $"{baseUrl}/uploads/cars/{fileName}" });
    }
}

public record SetAvailabilityRequest(bool IsAvailable);

using ArabaKiralama.Business.Abstract;
using ArabaKiralama.Business.DTOs.Car;
using ArabaKiralama.Business.Exceptions;
using ArabaKiralama.DataAccess.Abstract;
using ArabaKiralama.Entities;

namespace ArabaKiralama.Business.Concrete;

public class CarService : ICarService
{
    private readonly ICarRepository _carRepository;
    private readonly ICarCategoryRepository _categoryRepository;

    public CarService(ICarRepository carRepository, ICarCategoryRepository categoryRepository)
    {
        _carRepository = carRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<CarResponseDto>> GetAllCarsAsync()
    {
        var cars = await _carRepository.GetAllWithCategoryAsync();
        return cars.Select(MapToResponse);
    }

    public async Task<IEnumerable<CarResponseDto>> GetAvailableCarsAsync(DateOnly startDate, DateOnly endDate)
    {
        if (startDate >= endDate)
            throw new BusinessException("Başlangıç tarihi bitiş tarihinden önce olmalıdır.");

        var cars = await _carRepository.GetAvailableCarsAsync(startDate, endDate);
        return cars.Select(MapToResponse);
    }

    public async Task<CarResponseDto?> GetCarByIdAsync(int id)
    {
        var car = await _carRepository.GetByIdWithCategoryAsync(id);
        return car is null ? null : MapToResponse(car);
    }

    public async Task<CarResponseDto> CreateCarAsync(CarCreateDto dto)
    {
        var car = new Car
        {
            Brand = dto.Brand,
            Model = dto.Model,
            Year = dto.Year,
            Plate = dto.Plate.ToUpperInvariant(),
            DailyPrice = dto.DailyPrice,
            IsAvailable = dto.IsAvailable,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            FuelType = dto.FuelType,
            Transmission = dto.Transmission,
            SeatCount = dto.SeatCount,
            Mileage = dto.Mileage,
            CategoryId = dto.CategoryId
        };

        await _carRepository.AddAsync(car);
        await _carRepository.SaveAsync();

        var created = await _carRepository.GetByIdWithCategoryAsync(car.Id)
            ?? throw new BusinessException("Araç oluşturulurken hata oluştu.");

        return MapToResponse(created);
    }

    public async Task<CarResponseDto> UpdateCarAsync(int id, CarUpdateDto dto)
    {
        var car = await _carRepository.GetByIdWithCategoryAsync(id)
            ?? throw new BusinessException("Araç bulunamadı.");

        car.Brand = dto.Brand;
        car.Model = dto.Model;
        car.Year = dto.Year;
        car.Plate = dto.Plate.ToUpperInvariant();
        car.DailyPrice = dto.DailyPrice;
        car.IsAvailable = dto.IsAvailable;
        car.Description = dto.Description;
        car.ImageUrl = dto.ImageUrl;
        car.FuelType = dto.FuelType;
        car.Transmission = dto.Transmission;
        car.SeatCount = dto.SeatCount;
        car.Mileage = dto.Mileage;
        car.CategoryId = dto.CategoryId;

        _carRepository.Update(car);
        await _carRepository.SaveAsync();

        var updated = (await _carRepository.GetByIdWithCategoryAsync(id))!;
        return MapToResponse(updated);
    }

    public async Task DeleteCarAsync(int id)
    {
        var car = await _carRepository.GetByIdAsync(id)
            ?? throw new BusinessException("Araç bulunamadı.");

        _carRepository.Delete(car);
        await _carRepository.SaveAsync();
    }

    public async Task SetAvailabilityAsync(int id, bool isAvailable)
    {
        var car = await _carRepository.GetByIdAsync(id)
            ?? throw new BusinessException("Araç bulunamadı.");

        car.IsAvailable = isAvailable;
        _carRepository.Update(car);
        await _carRepository.SaveAsync();
    }

    public async Task<IEnumerable<CarCategoryDto>> GetCategoriesAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Select(c => new CarCategoryDto { Id = c.Id, Name = c.Name });
    }

    private static CarResponseDto MapToResponse(Car car) => new()
    {
        Id = car.Id,
        Brand = car.Brand,
        Model = car.Model,
        Year = car.Year,
        Plate = car.Plate,
        DailyPrice = car.DailyPrice,
        IsAvailable = car.IsAvailable,
        Description = car.Description,
        ImageUrl = car.ImageUrl,
        FuelType = car.FuelType,
        Transmission = car.Transmission,
        SeatCount = car.SeatCount,
        Mileage = car.Mileage,
        CategoryId = car.CategoryId,
        CategoryName = car.Category?.Name ?? string.Empty,
        CreatedAt = car.CreatedAt
    };
}

using ArabaKiralama.Business.DTOs.Car;

namespace ArabaKiralama.Business.Abstract;

public interface ICarService
{
    Task<IEnumerable<CarResponseDto>> GetAllCarsAsync();
    Task<IEnumerable<CarResponseDto>> GetAvailableCarsAsync(DateOnly startDate, DateOnly endDate);
    Task<CarResponseDto?> GetCarByIdAsync(int id);
    Task<CarResponseDto> CreateCarAsync(CarCreateDto dto);
    Task<CarResponseDto> UpdateCarAsync(int id, CarUpdateDto dto);
    Task DeleteCarAsync(int id);
    Task SetAvailabilityAsync(int id, bool isAvailable);
    Task<IEnumerable<CarCategoryDto>> GetCategoriesAsync();
}

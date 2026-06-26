using Logic.Dtos.User;

namespace Logic.Interfaces;

public interface IUserService
{
    Task<List<UserDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<UserDto?> SetEnabledAsync(Guid id, bool enabled, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

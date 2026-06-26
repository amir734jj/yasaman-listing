using EfCoreRepository.Extensions;
using EfCoreRepository.Interfaces;
using Logic.Dtos.User;
using Logic.Interfaces;
using Microsoft.AspNetCore.Identity;
using Models.Entities;

namespace Logic.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly IEfRepository _repository;
    private readonly IStorageService _storage;

    public UserService(UserManager<User> userManager, IEfRepository repository, IStorageService storage)
    {
        _userManager = userManager;
        _repository = repository;
        _storage = storage;
    }

    public async Task<List<UserDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = _userManager.Users.ToList();

        var result = new List<UserDto>(users.Count);
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(Map(user, roles));
        }

        return result.OrderByDescending(x => x.CreatedAt).ToList();
    }

    public async Task<UserDto?> SetEnabledAsync(Guid id, bool enabled, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null) return null;

        user.Enabled = enabled;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Map(user, roles);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null) return false;

        // Best-effort cleanup of the user's listing media from storage before the
        // database cascade removes the listing/media rows.
        var listings = await _repository.For<Listing>()
            .GetAll(filterExprs: [x => x.OwnerId == id]);

        foreach (var media in listings.SelectMany(l => l.Media))
        {
            await _storage.DeleteAsync(media.StorageKey, cancellationToken);
        }

        var result = await _userManager.DeleteAsync(user);
        return result.Succeeded;
    }

    private static UserDto Map(User user, IEnumerable<string> roles) => new()
    {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        DisplayName = user.DisplayName,
        Enabled = user.Enabled,
        CreatedAt = user.CreatedAt,
        Roles = roles.ToList()
    };
}

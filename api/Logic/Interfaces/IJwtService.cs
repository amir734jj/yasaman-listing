using Models.Entities;

namespace Logic.Interfaces;

public interface IJwtService
{
    (string Token, DateTimeOffset ExpiresAt) GenerateToken(User user, IList<string> roles);
}

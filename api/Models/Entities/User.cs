using Microsoft.AspNetCore.Identity;

namespace Models.Entities;

public class User : IdentityUser<Guid>
{
    public string? DisplayName { get; set; }

    public string? Description { get; set; }

    public bool Enabled { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
}

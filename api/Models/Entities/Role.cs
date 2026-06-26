using Microsoft.AspNetCore.Identity;

namespace Models.Entities;

public class Role : IdentityRole<Guid>
{
    public Role() { }

    public Role(string name) : base(name)
    {
    }
}

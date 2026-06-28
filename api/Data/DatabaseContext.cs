using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models.Entities;

namespace Data;

public class DatabaseContext(DbContextOptions<DatabaseContext> options) : IdentityDbContext<User, Role, Guid>(options)
{
    public DbSet<Listing> Listings => Set<Listing>();

    public DbSet<GlobalConfig> GlobalConfigs => Set<GlobalConfig>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(DatabaseContext).Assembly);
    }
}

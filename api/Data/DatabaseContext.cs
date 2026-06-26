using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Models.Entities;

namespace Data;

public class DatabaseContext : IdentityDbContext<User, Role, Guid>
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
    {
    }

    public DbSet<Listing> Listings => Set<Listing>();

    public DbSet<ListingMedia> ListingMedia => Set<ListingMedia>();

    public DbSet<GlobalConfig> GlobalConfigs => Set<GlobalConfig>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(DatabaseContext).Assembly);
    }
}

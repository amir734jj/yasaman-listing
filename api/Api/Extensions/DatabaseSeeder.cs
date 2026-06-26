using FluentMigrator.Runner;
using Microsoft.AspNetCore.Identity;
using Models.Constants;
using Models.Entities;

namespace Api.Extensions;

public static class DatabaseSeeder
{
    public static async Task MigrateAndSeedAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;

        // Apply schema migrations via FluentMigrator.
        services.GetRequiredService<IMigrationRunner>().MigrateUp();

        var roleManager = services.GetRequiredService<RoleManager<Role>>();
        foreach (var roleName in new[] { Roles.Admin, Roles.User })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new Role(roleName));
            }
        }
    }
}

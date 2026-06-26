using EfCoreRepository.Extensions;
using EfCoreRepository.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Models.Entities;
using Models.Enums;

namespace Logic.BackgroundJobs;

/// <summary>
/// Periodically marks listings that have been sold for more than 7 days as unavailable.
/// </summary>
public class ListingExpiryJob : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);
    private static readonly TimeSpan SoldRetention = TimeSpan.FromDays(7);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ListingExpiryJob> _logger;

    public ListingExpiryJob(IServiceScopeFactory scopeFactory, ILogger<ListingExpiryJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ExpireListingsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to expire sold listings.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task ExpireListingsAsync(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IEfRepository>();
        var listings = repository.For<Listing>();

        var threshold = DateTimeOffset.UtcNow - SoldRetention;

        var expired = (await listings.GetAll(
            filterExprs: [x => x.Status == ListingStatus.Sold && x.SoldAt != null && x.SoldAt <= threshold]))
            .ToList();

        if (expired.Count == 0) return;

        foreach (var listing in expired)
        {
            await listings.Update(listing.Id, x =>
            {
                x.Status = ListingStatus.Unavailable;
                x.UpdatedAt = DateTimeOffset.UtcNow;
            });
        }

        _logger.LogInformation("Marked {Count} sold listing(s) as unavailable.", expired.Count);
    }
}

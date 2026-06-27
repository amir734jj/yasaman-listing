using System.ComponentModel.DataAnnotations;
using Models.Enums;

namespace Logic.Dtos.Listing;

public class ListingDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
    public ListingStatus Status { get; set; }
    public DateTimeOffset? SoldAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public List<Guid> Media { get; set; } = new();
}

public class CreateListingRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Price { get; set; } = string.Empty;

    public List<string> Tags { get; set; } = new();
}

public class UpdateListingRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Price { get; set; } = string.Empty;

    public List<string> Tags { get; set; } = new();
}

public enum ListingSortBy
{
    MostRecent = 0,
    PriceAsc = 1,
    PriceDesc = 2
}

public class ListingSearchRequest
{
    public string? Search { get; set; }
    public ListingStatus? Status { get; set; }
    public ListingSortBy SortBy { get; set; } = ListingSortBy.MostRecent;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

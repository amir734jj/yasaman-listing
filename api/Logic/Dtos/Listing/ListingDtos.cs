using System.ComponentModel.DataAnnotations;
using Models.Enums;

namespace Logic.Dtos.Listing;

public class ListingMediaDto
{
    public Guid Id { get; set; }
    public MediaType Type { get; set; }
    public string Url { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class ListingDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public ListingStatus Status { get; set; }
    public DateTimeOffset? SoldAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public List<ListingMediaDto> Media { get; set; } = new();
}

public class CreateListingRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [Range(0, 1_000_000_000)]
    public decimal Price { get; set; }
}

public class UpdateListingRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [Range(0, 1_000_000_000)]
    public decimal Price { get; set; }
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
